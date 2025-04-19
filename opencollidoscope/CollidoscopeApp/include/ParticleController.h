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

#pragma once

#include "cinder/gl/gl.h"
#include <vector>

/**
 * The ParticleController creates/updates/draws and destroys particles
 */ 
class ParticleController {

    struct Particle {

        ci::vec2	mCloudCenter; // initial positin of the particle 
        ci::vec2	mVel;         // velocity 
        float       mCloudSize;   // how big is the area where particle float around. When a particle hits the 
                                  // border of the area it gets deflected 

        int			mAge;      // when mAge == mLifeSpan the particle is disposed 
        int			mLifespan; // how long a particle lives
        bool        mFlyOver;  // some particles last longer and fly over the screen and reach the other user

    };

    static const int kMaxParticles = 150;

	std::vector<Particle> mParticles;
    std::vector< ci::vec2 > mParticlePositions;

    // current number of active particles
    size_t mNumParticles;

    ci::gl::VboRef			mParticleVbo;    // virtual buffer object 
    ci::gl::BatchRef		mParticleBatch;

 public:
    /**
     * Every time addParticles is run, up to kMaxParticleAdd are added at once
     */ 
    static const int kMaxParticleAdd = 22;

    ParticleController();

    /**
     * Adds \a amount particles and places them in \a initialLocation. 
     * \cloudSize determines how far the particles can go
     */ 
	void addParticles(int amount, const ci::vec2 &initialLocation, const float cloudSize);
	
    /**
     * Updates position and age of the particles
     */ 
    void updateParticles();

    /**
     * Draws all the particles
     */ 
    inline void draw()
    {
        mParticleBatch->draw();
    }
	
};

