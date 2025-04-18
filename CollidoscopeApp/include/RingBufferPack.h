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
*/

#pragma once

#include "cinder/audio/dsp/RingBuffer.h"


/** Packs together a cinder::audio::dsp::RingBuffer and the related array used passed as argument to exchange data (read/write) with the ring buffer  */
template <typename T>
class RingBufferPack {

public:

    RingBufferPack( size_t size ) :
        mSize( size ),
        mBuffer( size )
    {
        mArray = new T[size];
    }

    ~RingBufferPack()
    {
        delete[]  mArray;
    }

    // no copy
    RingBufferPack( const RingBufferPack &copy ) = delete;
    RingBufferPack & operator=(const RingBufferPack &copy) = delete;

    ci::audio::dsp::RingBufferT<T> & getBuffer() { return mBuffer; }

    T* getExchangeArray() { return mArray; }

    std::size_t getSize() { return mSize;  }

private:
    size_t mSize;

    ci::audio::dsp::RingBufferT<T> mBuffer;

    T* mArray;


};
