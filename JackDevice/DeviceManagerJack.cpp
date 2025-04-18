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

#include "cinder/audio/linux/DeviceManagerJack.h"
#include "cinder/audio/Exception.h"
#include <jack/jack.h>


namespace cinder { namespace audio { namespace linux {

DeviceManagerJack::DeviceManagerJack() 
{

    // hardcoded devices. They are always JackIn and JackOut 
    mDevices.push_back( addDevice("JackIn") );
    mDevices.push_back( addDevice("JackOut") );

    jack_status_t status;
    
    // open a jack client, get info and close
    jack_client_t *client = jack_client_open ("device info", JackNullOption, &status, NULL);
    if( client == NULL){

        std::string msg = "jack_client_open() failed. "; 
        if(status & JackServerFailed) 
            msg += "Unable to connect to Jack server";

        throw cinder::audio::AudioContextExc(msg);
    }

    mSampleRate = jack_get_sample_rate( client );
    mBufferSize = jack_get_buffer_size( client );

    jack_client_close( client );
}

DeviceManagerJack::~DeviceManagerJack()
{
    
}

const std::vector<DeviceRef>& DeviceManagerJack::getDevices()
{
   return mDevices;
}

DeviceRef DeviceManagerJack::getDefaultOutput()
{
    return mDevices[1];
}

DeviceRef DeviceManagerJack::getDefaultInput()
{
    return mDevices[0];
}

//hardcoded name same as key 
std::string DeviceManagerJack::getName( const DeviceRef &device )
{
    return device->getKey();
}

size_t DeviceManagerJack::getNumInputChannels( const DeviceRef &device )
{
    if( device->getKey() == mDevices[0]->getKey() )
        return 2;
    else
        return 0;
}

size_t DeviceManagerJack::getNumOutputChannels( const DeviceRef &device )
{
    if( device->getKey() == mDevices[1]->getKey() )
        return 2;
    else
        return 0;
}

size_t DeviceManagerJack::getSampleRate( const DeviceRef &device )
{
    return mSampleRate;
}

size_t DeviceManagerJack::getFramesPerBlock( const DeviceRef &device )
{
    return mBufferSize;
}


void DeviceManagerJack::setSampleRate( const DeviceRef &device, size_t sampleRate )
{
    throw "setSampleRate not supported";
}

void DeviceManagerJack::setFramesPerBlock( const DeviceRef &device, size_t framesPerBlock )
{
    throw "setFramesPerBlock not supported";
}


//! Returns the hardware's actual frames per block, which might not be a power of two.
//        size_t getFramesPerBlockHardware( const DeviceRef &device );
//

size_t DeviceManagerJack::getFramesPerBlockHardware( const DeviceRef &device )
{
    return mBufferSize;
}






} } } // namespace cinder::audio::linux
