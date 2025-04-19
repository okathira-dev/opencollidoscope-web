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

#include "cinder/Area.h"

/**
 * The DrawInfo class holds size information for drawing the waves in the screen. 
 * Every time the screen is resized the draw info is updated with the new information about the window size.
 *
 * Every wave has its own drawInfo.
 *
 */ 
class DrawInfo
{
public:

    /**
     * Constructor. Takes the index of the wave as argument.
     */ 
    DrawInfo( size_t waveIndex ):
        mWaveIndex( waveIndex ),
        mWindowWidth(0),
        mWindowHeight(0),
        mSelectionBarHeight(0),
        mShrinkFactor(1)
    {}

    /**
     * Reset this DrawInfo using the new bounding area for the wave.  \a shrinkFactor 
     * makes the wave shrink on the y axis with respect to the area. A factor 1 makes the wave as big as the area, whereas a factor >1 makes it shrink.
     */ 
    void reset( const ci::Area &bounds, float shrinkFactor )
    {
        mWindowWidth = bounds.getWidth();
        mWindowHeight = bounds.getHeight();
        mSelectionBarHeight = mWindowHeight / NUM_WAVES;
        mShrinkFactor = shrinkFactor;
    }

    /**
     * Maps a value in the audio space [-1.0, 1.0] to a position on the y axis of this DrawInfo's bounding area.
     *
     */ 
    float audioToHeigt(float audioSample) const {
        /* clip into range [-1.1] */
        if (audioSample < -1.0f) {
            audioSample = -1.0f;
        }
        else if ( audioSample > 1.0f ){
            audioSample = 1.0f;
        }

        /* map from [-1,1] to [0,1] */
        float ratio = (audioSample - (-1.0f)) * 0.5f; // 2 = 1 - (-1) 

        /* get bottom and add the scaled height */
        return ratio * mSelectionBarHeight; //remove  bounds.getY1() bound only needed for size of tier
    }

    float getMaxChunkHeight() const 
    {
        return mSelectionBarHeight * mShrinkFactor;
    }

    float getSelectionBarHeight() const
    {
        return mSelectionBarHeight;
    }

    /**
     * Returns the center position on the y axis of this DrawInfo's the bounding area. 
     */ 
    int32_t getWaveCenterY() const
    {
        if ( mWaveIndex == 0 )
            return mWindowHeight - ( mWindowHeight / ( 2 * NUM_WAVES ) ) + 1;
        else
            return mWindowHeight / (NUM_WAVES * 2);
    }

    /**
     * Flips y according to the index of the wave. It is needed because the second wave in collidoscope is drawn upside down in the screen.
     */ 
    int flipY(int y) const 
    {
        if ( mWaveIndex == 0)
            return mWindowHeight - y;
        else
            return y;
    }

    /**
     * Returns x. not used at the moment.
     *
     */ 
    int flipX(int x) const
    {
        return x;
    }


    // how much the wave is shrunk on the y axis with respect to the wave's tier 
    float getShrinkFactor() const 
    {
        return mShrinkFactor;
    }

    int32_t getWindowWidth() const
    {
        return mWindowWidth;
    }

    int32_t getWindowHeight() const
    {
        return mWindowHeight;
    }

    /**
     * Draw infos cannot be copied and should be passed as const reference.
     */ 
    DrawInfo( const DrawInfo &original ) = delete;
    DrawInfo & operator=( const DrawInfo &original ) = delete;

private:
    const size_t mWaveIndex;

    int32_t mWindowHeight;
    int32_t mWindowWidth;
    int32_t mSelectionBarHeight;

    float mShrinkFactor;

};
