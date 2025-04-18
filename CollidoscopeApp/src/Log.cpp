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


#include "cinder/Log.h"

bool fileLoggerCreated = false;

void logError( const std::string &errorMsg )
{
    using namespace ci::log;

    if ( !fileLoggerCreated ){
        makeLogger<ci::log::LoggerFile>( "./collidoscope_error.log" );
        fileLoggerCreated = true;
    }

    LogManager *log = LogManager::instance();

    Metadata logMeta;
    logMeta.mLevel = LEVEL_ERROR;

    log->write( logMeta, errorMsg );

}

void logInfo( const std::string &infoMsg )
{
#ifdef _DEBUG
    using namespace ci::log;

    LogManager *log = LogManager::instance();

    Metadata logMeta;
    logMeta.mLevel = LEVEL_INFO;

    log->write( logMeta, infoMsg );
#endif
}
