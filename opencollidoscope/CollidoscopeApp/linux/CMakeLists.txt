# Basic
cmake_minimum_required( VERSION 2.8 FATAL_ERROR )
set( CMAKE_VERBOSE_MAKEFILE on )

get_filename_component( CINDER_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." ABSOLUTE )
include( ${CINDER_DIR}/linux/cmake/Cinder.cmake )

project( CollidoscopeApp )

get_filename_component( SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../src" ABSOLUTE )
get_filename_component( INC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../include" ABSOLUTE )

if( NOT TARGET cinder${CINDER_LIB_SUFFIX} )
    find_package( cinder REQUIRED
        PATHS ${PROJECT_SOURCE_DIR}/../../../linux/${CMAKE_BUILD_TYPE}/${CINDER_OUT_DIR_PREFIX}
        $ENV{Cinder_DIR}/linux/${CMAKE_BUILD_TYPE}/${CINDER_OUT_DIR_PREFIX}
    )
endif()

add_definitions(-DNUM_WAVES=2)
add_definitions(-D__LINUX_ALSA__)
add_definitions(-DUSE_PARTICLES)

# Use PROJECT_NAME since CMAKE_PROJET_NAME returns the top-level project name.
set( EXE_NAME ${PROJECT_NAME} )

set( SRC_FILES
    ${SRC_DIR}/CollidoscopeApp.cpp
	${SRC_DIR}/AudioEngine.cpp
	${SRC_DIR}/BufferToWaveRecorderNode.cpp
	${SRC_DIR}/Chunk.cpp
	${SRC_DIR}/Config.cpp
	${SRC_DIR}/Log.cpp
	${SRC_DIR}/MIDI.cpp
	${SRC_DIR}/PGranularNode.cpp
	${SRC_DIR}/RtMidi.cpp
	${SRC_DIR}/Wave.cpp
    ${SRC_DIR}/ParticleController.cpp
)

add_executable( "${EXE_NAME}" ${SRC_FILES} )

target_include_directories(
	"${EXE_NAME}"
	PUBLIC ${INC_DIR}
)

target_link_libraries( "${EXE_NAME}" cinder${CINDER_LIB_SUFFIX} )
target_link_libraries( "${EXE_NAME}" jack )
target_link_libraries( "${EXE_NAME}" asound )

