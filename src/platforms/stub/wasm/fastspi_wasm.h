#pragma once

#ifndef __EMSCRIPTEN__
#error "This file should only be included in an Emscripten build"
#endif

#include <stdint.h>

#include "namespace.h"

FASTLED_NAMESPACE_BEGIN

#define FASTLED_ALL_PINS_HARDWARE_SPI

class WasmSpiOutput {
public:
    WasmSpiOutput();
    void select();
    void init();
    void waitFully();
    void release();
    void writeByte(uint8_t byte);
    void writeWord(uint16_t word);
};

// Compatibility alias
typedef WasmSpiOutput StubSPIOutput;

FASTLED_NAMESPACE_END