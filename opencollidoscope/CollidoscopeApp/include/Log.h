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


/**
 * Utility function to log errors using the cinder::log library.
 * Errors are logged to collidoscope_error.log file. 
 *
 */ 
void logError( const std::string &errorMsg );


/**
 * Utility function to log info using the cinder::log library.
 * Errors are logged to the terminal. Used only for debugging.
 *
 */ 
void logInfo( const std::string &infoMsg );
