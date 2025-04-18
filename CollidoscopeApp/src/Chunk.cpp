/*

 Copyright (C) 2015  Fiore Martin
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


#include "Chunk.h"
#include "DrawInfo.h"


#include "cinder/gl/gl.h"


Chunk::Chunk( size_t index ) :
    mIndex( index ),
    mAudioTop(0.0f),
    mAudioBottom(0.0f)
    {}


void update( const DrawInfo& di )
{

}

void Chunk::update( const DrawInfo &di )
{
    using namespace ci;
    /* if resetting animate the chunks to nicely shrink to 0 size */
    if ( mResetting ){
        if ( mAnimate > 0.0f ){
            mAnimate -= 0.1f;
            if ( mAnimate <= 0.0f ){
                mAnimate = 0.0f;
                mResetting = false;
                mAudioTop = 0.0f;
                mAudioBottom = 0.0f;
            }
        }
    }
    /* animate makes the chunks pop nicely when they are created */
    else if ( mAnimate < 1.0f ){
        mAnimate += 0.3333f; // in three (namely 1/0.333) steps
        if ( mAnimate > 1.0f ){ // clip to one
            mAnimate = 1.0f;
        }
    }

    mX = di.flipX( 1 + (mIndex * (2 + kWidth)) ); // FIXME more efficient if it happens only once when resized 
}

void Chunk::draw( const DrawInfo& di, ci::gl::BatchRef &batch ){
    using namespace ci;
    
    gl::pushModelMatrix();

    const float chunkHeight = mAnimate * mAudioTop * di.getMaxChunkHeight();

    // place the chunk in the right position brings back the y of chunkHeight/2 so
    // so that after scaling the wave is still centered at the wave center 
    gl::translate( mX, di.getWaveCenterY() - ( chunkHeight / 2 ) - 1 );

    // scale according to audio amplitude 
    gl::scale( 1.0f, chunkHeight );
    batch->draw();
    
    
    gl::popModelMatrix();
}


void Chunk::drawBar( const DrawInfo& di, ci::gl::BatchRef &batch ){
    using namespace ci;

    gl::pushModelMatrix();

    const float barHeight = di.getSelectionBarHeight();

    gl::translate( mX, di.getWaveCenterY() - ( barHeight / 2 ) - 1 );
    gl::scale( 1.0f, barHeight );

    batch->draw();

    gl::popModelMatrix();
}


const float Chunk::kWidth = 7.0f;
const float Chunk::kHalfWidth = 3.5f;
