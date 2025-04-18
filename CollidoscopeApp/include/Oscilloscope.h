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

#include "cinder/gl/gl.h"

#include "DrawInfo.h"



/**
 * The oscilloscope that oscillates when Collidoscope is played 
 */ 
class Oscilloscope
{

public:

    /**
     * Constructor, accepts as argument the number of points that make up the oscilloscope line 
     */ 
    Oscilloscope( size_t numPoints ):
        mNumPoints( numPoints ),
        mLine( std::vector<ci::vec2>( numPoints, ci::vec2() ) )
        {}

    /**
     * Sets the value of a point of the oscilloscope. The value is passed in audio coordinates [-1.0, 1.0].
     * A reference to DrawInfo is passed to calculate the graphic coordinate of the point based on the audio values passed. 
     */ 
    void  setPoint( int index, float audioVal, const DrawInfo &di ){

        if ( audioVal > 1.0f ){
            audioVal = 1.0f;
        }
        else if ( audioVal < -1.0f ){
            audioVal = -1.0f;
        }

        audioVal *= 0.8f;
        // map audio val from [-1.0, 1.0] to [0.0, 1.0]
        // then map the value obtained to the height of the wave tier ( window height / NUM_WAVES ) 
        float yRatio = ((1 + audioVal) / 2.0f) * (di.getWindowHeight() / NUM_WAVES );
        float xRatio = index * (di.getWindowWidth() / (float)mLine.size());

        // this flips the coordinates for the second wave 
        mLine.getPoints()[index].x = float( di.flipX( int(xRatio) ) );
        mLine.getPoints()[index].y = float( di.flipY( int(yRatio) ) );

        // add the missing line to reach the right of the window.
        // Indeed, the scope starts from 0 to size-1 and adds xRatio
        // to each new point. The line from n-1 to n is therefore missing.
        if (index == mNumPoints - 1){
            xRatio += ( di.getWindowWidth() / mNumPoints );
            xRatio = ceil( xRatio ); // ceil because the division might left one pixel out

            mLine.getPoints()[mNumPoints - 1].x = di.flipX( xRatio ); 
            mLine.getPoints()[mNumPoints - 1].y = di.flipY( yRatio );
        }

    }

    /**
     * Draws this oscilloscope as a cinder::PolyLine2f
     */ 
    void draw()
    {
        ci::gl::color(1.0f, 1.0f, 1.0f);
        ci::gl::draw( mLine );
    }

    size_t getNumPoints() const
    {
        return mNumPoints;
    }

private:
    size_t mNumPoints;
    ci::PolyLine2f  mLine;

};
