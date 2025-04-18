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

#pragma once

#include "cinder/audio/Context.h" 
#include <jack/jack.h>

namespace cinder { namespace audio { namespace linux {

class ContextJack;
class InputDeviceNodeJack;

/**
 * OutputNode (as in the cinder::audio::OutputNode) that sends audio to the sound card using the jack audio callback method. 
 */ 
class OutputDeviceNodeJack : public OutputDeviceNode {
  public:
    OutputDeviceNodeJack( const DeviceRef &device, const Format &format, const std::shared_ptr<ContextJack> &context );

    /** Gives this output node a reference to the JackInputNode. 
     *  In initialize() the reference is used to give the input node access to jack input ports 
     */
    void setInput(InputDeviceNodeRef inputDeviceNode);

  protected:
    void initialize()               override;
    void uninitialize()             override;
    void enableProcessing()         override;
    void disableProcessing()        override;
    bool supportsProcessInPlace() const override    { return false; }

  private:
    // this is called by jack in the audio thread at every tick of the sound card 
    static int jackCallback(jack_nframes_t nframes, void* userData);


    void renderToBufferFromInputs();

    /**
     * RenderData is passed as user_data to jack when the jack process callback is installed
     */ 
    struct RenderData{
        RenderData() : inputNode(nullptr), outputNode(nullptr), context(nullptr){}
        ~RenderData() { inputNode = nullptr; outputNode = nullptr;  context = nullptr; }
        Node* outputNode;
        Node* inputNode;
        ContextJack* context;
    } mRenderData;

    std::weak_ptr<ContextJack>  mCinderContext;

    jack_client_t *mClient;

    std::array< jack_port_t*, 2 > mOutputPorts;

    std::shared_ptr<InputDeviceNodeJack> mInputDeviceNode;
};

/**
 * InputNode (as in the cinder::audio::OutputNode) that reads audio from the sound card using the jack audio callback method. 
 */ 
class InputDeviceNodeJack : public InputDeviceNode {
  friend OutputDeviceNodeJack;

  public:
    InputDeviceNodeJack( const DeviceRef &device, const Format &format, const std::shared_ptr<ContextJack> &context );

  protected:
    void initialize()               override;
    void uninitialize()             override;
    void enableProcessing()         override;
    void disableProcessing()        override;
    void process( Buffer *buffer )  override;

  private:
    std::array< jack_port_t*, 2 > mInputPorts;
};

class ContextJack : public Context {
  public:
    ContextJack() {}
    virtual ~ContextJack() {}
    

    OutputDeviceNodeRef createOutputDeviceNode( const DeviceRef &device, const Node::Format &format = Node::Format() ) override;
    InputDeviceNodeRef  createInputDeviceNode( const DeviceRef &device, const Node::Format &format = Node::Format()  ) override;

    OutputDeviceNodeRef mOutputDeviceNode;
    InputDeviceNodeRef  mInputDeviceNode;


  private:
};  

} } } // namespace cinder::audio::linux

