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

#include "cinder/audio/Device.h"

namespace cinder { namespace audio { namespace linux {

/**
 * DeviceManager ( as in cinder::audio::DeviceManager ) that handle the hardware device through the jack library.
 * Note that this is not suitable for general purpose use. Most of the functionalities are indeed hard coded
 * just to suit Collidoscope needs. In particular only two input and two output ports are assumed. 
 *
 */ 
class DeviceManagerJack : public DeviceManager {
  public:

    DeviceManagerJack();
    virtual ~DeviceManagerJack();

    const std::vector<DeviceRef>& getDevices()      override;
    DeviceRef getDefaultOutput()                override;
    DeviceRef getDefaultInput()             override;

    std::string getName( const DeviceRef &device )      override;
    size_t getNumInputChannels( const DeviceRef &device )   override;
    size_t getNumOutputChannels( const DeviceRef &device )  override;
    size_t getSampleRate( const DeviceRef &device )     override;
    size_t getFramesPerBlock( const DeviceRef &device ) override;

    void setSampleRate( const DeviceRef &device, size_t sampleRate )        override;
    void setFramesPerBlock( const DeviceRef &device, size_t framesPerBlock )    override;

    //! Returns the hardware's actual frames per block, which might not be a power of two.
    size_t getFramesPerBlockHardware( const DeviceRef &device );

private:

    std::vector<DeviceRef> mDevices;
    DeviceRef   mDefaultOutDevice;
    DeviceRef   mDefaultInDevice;
    size_t mSampleRate;
    size_t mBufferSize;
};  

} } } // namespace cinder::audio::linux     
