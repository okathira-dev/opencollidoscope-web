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

#include "Config.h"


#include "cinder/Exception.h"
#include "boost/algorithm/string/trim.hpp"

using ci::DataSourceRef;
using ci::XmlTree;
using ci::loadFile;


Config::Config() :
    mAudioInputDeviceKey( "" ),
    mNumChunks(150),
    mWaveLen(2.0)
{

}

// uses Cinder api to parse configuration in XML file 
void Config::loadFromFile( std::string&& path )
{
    try {
        XmlTree doc( loadFile( path ) );

        XmlTree collidoscope = doc.getChild( "collidoscope" );

        // audio input device 
        mAudioInputDeviceKey = collidoscope.getChild( "audioInputDeviceKey" ).getValue();
        boost::trim( mAudioInputDeviceKey );

        // wave len in seconds 
        std::string waveLenStr = collidoscope.getChild("wave_len").getValue();
        boost::trim(waveLenStr);
        mWaveLen = ci::fromString<double>(waveLenStr);

        // channel for each wave 
        XmlTree waves = collidoscope.getChild( "waves" );

        for ( int i = 0; i < NUM_WAVES; i++ ){
            for ( auto &wave : waves.getChildren() ){
                int id = ci::fromString<int>( wave->getAttribute( "id" ) );
                if ( id == i ){
                    parseWave( *wave, id );
                    break;
                }
            }
        }

    }
    catch ( std::exception &e ) {
        throw ci::Exception( e.what() );
    }
    


}

// thows exception captured in loadFromFile 
void Config::parseWave( const XmlTree &wave, int id )
{
    // midi channel 
    std::string midiChannelStr = wave.getChild( "midiChannel" ).getValue();
    boost::trim( midiChannelStr );

    mMidiChannels[id] = ci::fromString<size_t>( midiChannelStr );

}
