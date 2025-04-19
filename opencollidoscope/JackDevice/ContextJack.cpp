/*

 Copyright (C) 2016  Queen Mary University of London 
 Author: Fiore Martin

 This file is part of Collidoscope.
 
 Collidoscope is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 This file incorporates work covered by the following copyright and permission notice: 

    Copyright (c) 2014, The Cinder Project

    This code is intended to be used with the Cinder C++ library, http://libcinder.org

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that
    the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and
    the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
    the following disclaimer in the documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
    WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
    TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
 
*/


#include "cinder/audio/linux/ContextJack.h"
#include "cinder/audio/Exception.h"

#define NUM_CHANNELS 2

namespace cinder { namespace audio { namespace linux {



//--------------------------------------static utilities------------------------------------------

inline void zeroJackPort( jack_port_t *port, jack_nframes_t nframes )
{   
  // FIXME seg fault at shutdown 
  // memset(port, 0, sizeof(jack_default_audio_sample_t) * nframes); 
}

// copy audio from node buffer to jack port 
inline void copyToJackPort(jack_port_t *port, float *source, jack_nframes_t nframes )
{
    jack_default_audio_sample_t *out;
    out = (jack_default_audio_sample_t *) jack_port_get_buffer( port, nframes );

    memcpy( out, source, sizeof(jack_default_audio_sample_t) * nframes ) ;
}

// copy audio from jack port to  node buffer
inline void copyFromJackPort(jack_port_t *port, float *dest, jack_nframes_t nframes )
{
    jack_default_audio_sample_t *in;
    in = (jack_default_audio_sample_t *) jack_port_get_buffer( port, nframes );

    memcpy( dest, in, sizeof(jack_default_audio_sample_t) * nframes ) ;
}


// -------------------------------OutputDeviceNodeJack-------------------------------------------

int OutputDeviceNodeJack::jackCallback(jack_nframes_t nframes, void* userData)
{
    // retrieve user data 
    RenderData *renderData = static_cast<RenderData *>( userData );

    OutputDeviceNodeJack *outputDeviceNode = static_cast<OutputDeviceNodeJack *>( renderData->outputNode );

    auto ctx = renderData->outputNode->getContext();
    if( ! ctx ) {
        // this is from some cinder library code but it should not happen in Collidoscope as the context is set
        for( size_t chan = 0; chan < NUM_CHANNELS; chan++)
            zeroJackPort( outputDeviceNode->mOutputPorts[chan], nframes );

        return 0;
    }

    std::lock_guard<std::mutex> lock( ctx->getMutex() );
    
    // verify associated context still exists, which may not be true if we blocked in ~Context() and were then deallocated.
    ctx = renderData->outputNode->getContext();
    if( ! ctx ) {

        for( size_t chan = 0; chan < NUM_CHANNELS; chan++)
            zeroJackPort( outputDeviceNode->mOutputPorts[chan], nframes );

        return 0;
    }


    Buffer *internalBuffer = outputDeviceNode->getInternalBuffer();
    internalBuffer->zero();

    ctx->preProcess();
    // process the whole audio graph using by recursively pulling the input all the way to the top of the graph 
    outputDeviceNode->pullInputs( internalBuffer );
    
    // if clip detection is enabled and buffer clipped, silence it
    //if( outputDeviceNode->checkNotClipping() ){
        //for( size_t chan = 0; chan < NUM_CHANNELS; chan++)
        //    zeroJackPort( outputDeviceNode->mOutputPorts[chan], nframes );
    //} 
    //else {
        for( size_t chan = 0; chan < NUM_CHANNELS; chan++)
            copyToJackPort( outputDeviceNode->mOutputPorts[chan], internalBuffer->getChannel( chan ), nframes  );
    //}

    ctx->postProcess();

    return 0;
}

inline void OutputDeviceNodeJack::setInput( InputDeviceNodeRef inputDeviceNode) 
{
    mInputDeviceNode = std::static_pointer_cast<InputDeviceNodeJack>(inputDeviceNode);
}

OutputDeviceNodeJack::OutputDeviceNodeJack( const DeviceRef &device, const Format &format, const std::shared_ptr<ContextJack> &context ):
    OutputDeviceNode( device, format),
    mCinderContext( context )
{
}

void OutputDeviceNodeJack::initialize()
{

    const char *client_name = "Collidoscope";
    const char *server_name = NULL;
    jack_options_t options = JackNullOption;
    jack_status_t status;

    // connect to Jack server 
    mClient = jack_client_open (client_name, options, &status, server_name);
    if( mClient == NULL){

        std::string msg = "jack_client_open() failed. "; 
        if(status & JackServerFailed) 
            msg += "Unable to connect to Jack server";

        throw cinder::audio::AudioContextExc(msg);
    }

    
    // prepare user data for callback 
    mRenderData.outputNode = this;
    mRenderData.inputNode = mInputDeviceNode.get();
    CI_ASSERT(mInputDeviceNode != nullptr);
    mRenderData.context = static_cast<ContextJack *>( getContext().get() );

    // install callback
    jack_set_process_callback (mClient, jackCallback, &mRenderData );

    // jack shutdown ? 
    

    // setup output ports 
    mOutputPorts[0] = jack_port_register (mClient, "output1",
                       JACK_DEFAULT_AUDIO_TYPE,
                       JackPortIsOutput, 0);
    
    mOutputPorts[1] = jack_port_register (mClient, "output2",
                       JACK_DEFAULT_AUDIO_TYPE,
                       JackPortIsOutput, 0);
    
     if ((mOutputPorts[0] == NULL) || (mOutputPorts[0] == NULL)) {
        throw cinder::audio::AudioContextExc("no more JACK ports available");
     }

    // setup input ports. Note that the reference to the input node is used. 
    mInputDeviceNode->mInputPorts[0] = jack_port_register (mClient, "input1",
                       JACK_DEFAULT_AUDIO_TYPE,
                       JackPortIsInput, 0);

    mInputDeviceNode->mInputPorts[1] = jack_port_register (mClient, "input2",
                       JACK_DEFAULT_AUDIO_TYPE,
                       JackPortIsInput, 0);


    /* Tell the Jack server that we are ready to roll.  Our callback will start running now. */
    if (jack_activate (mClient)) {
        throw cinder::audio::AudioContextExc("cannot activate client");
    }

    // connect input ports to physical device (microphones)
    const char **mikePorts = jack_get_ports (mClient, NULL, NULL,
        JackPortIsPhysical|JackPortIsOutput);

    if (mikePorts == NULL) {
        throw cinder::audio::AudioContextExc("no physical input ports available");
    }

    if (jack_connect (mClient,  mikePorts[0], jack_port_name (mInputDeviceNode->mInputPorts[0]))) {
        throw cinder::audio::AudioContextExc("cannot connect input port 0");
    }

    if (jack_connect (mClient, mikePorts[1], jack_port_name( mInputDeviceNode->mInputPorts[1]) )) {
        throw cinder::audio::AudioContextExc("cannot connect input port 1");
    }

    // connect output ports to physical device (audio out )
    const char **speakerPorts = jack_get_ports (mClient, NULL, NULL,
                JackPortIsPhysical|JackPortIsInput);

    if (speakerPorts == NULL) {
        throw cinder::audio::AudioContextExc("no physical output ports available");
    }

    if (jack_connect (mClient, jack_port_name (mOutputPorts[0]), speakerPorts[0])) {
        throw cinder::audio::AudioContextExc("cannot connect output port 0");
    }

    if (jack_connect (mClient, jack_port_name (mOutputPorts[1]), speakerPorts[1])) {
        throw cinder::audio::AudioContextExc("cannot connect output port 1");
    }

    jack_free( mikePorts );
    jack_free( speakerPorts );
}


void OutputDeviceNodeJack::uninitialize()
{
    jack_client_close( mClient );
}

void OutputDeviceNodeJack::enableProcessing()
{
}

void OutputDeviceNodeJack::disableProcessing()
{
}


//----------------------------------------- InputDeviceNodeJack ---------------------------------------------------


InputDeviceNodeJack::InputDeviceNodeJack( const DeviceRef &device, const Format &format, const std::shared_ptr<ContextJack> &context ):
    InputDeviceNode( device, format)
{
}

void InputDeviceNodeJack::initialize() 
{
}

void InputDeviceNodeJack::uninitialize()
{
}

void InputDeviceNodeJack::enableProcessing()
{
}

void InputDeviceNodeJack::disableProcessing()
{
}

// This is called when the output node pull all the inputs in the jack callback. 
// Takes audio interface input from the jack port and copies it in the node buffer
void InputDeviceNodeJack::process( Buffer *buffer )
{
    for( size_t chan = 0; chan < NUM_CHANNELS; chan++){
       copyFromJackPort(mInputPorts[chan], buffer->getChannel( chan ), buffer->getNumFrames() ); 
    }
}


//-------------------------------------------ContextJack-----------------------------------------------------------

OutputDeviceNodeRef ContextJack::createOutputDeviceNode( const DeviceRef &device, const Node::Format &format )
{
    
    if( mOutputDeviceNode  == nullptr ) {
        auto thisRef = std::static_pointer_cast<ContextJack>( shared_from_this() );

        mOutputDeviceNode = makeNode( new OutputDeviceNodeJack( device, Node::Format().channels(NUM_CHANNELS), thisRef ) ) ;

        // the output device node must have a reference to input device node. In OutputDeviceNodeJack::initialize() 
        // the input node is passed the jack input ports that it will use to fetch incoming audio from the audio interface
        // Whichever node (input or ouput) gets initialized after the other, executes the following block:
        if( mInputDeviceNode != nullptr){
            auto castedOutputDeviceNode = std::static_pointer_cast<OutputDeviceNodeJack>( mOutputDeviceNode );
            castedOutputDeviceNode->setInput( mInputDeviceNode );   
        }
    }

    return mOutputDeviceNode;
}

InputDeviceNodeRef ContextJack::createInputDeviceNode( const DeviceRef &device, const Node::Format &format  )
{
    if( mInputDeviceNode  == nullptr ) {
        auto thisRef = std::static_pointer_cast<ContextJack>( shared_from_this() );

        mInputDeviceNode = makeNode( new InputDeviceNodeJack( device, Node::Format().channels( NUM_CHANNELS ), thisRef ) ) ;

        // the output device node must have a reference to input device node. In OutputDeviceNodeJack::initialize() 
        // the input node is passed the jack input ports that it will use to fetch incoming audio from the audio interface
        // Whichever node (input or ouput) gets initialized after the other, executes the following block:
        if( mOutputDeviceNode != nullptr){
            auto castedOutputDeviceNode = std::static_pointer_cast<OutputDeviceNodeJack>( mOutputDeviceNode );
            castedOutputDeviceNode->setInput( mInputDeviceNode );   
        }
    }

    return mInputDeviceNode;
}





} } } // namespace cinder::audio::linux
