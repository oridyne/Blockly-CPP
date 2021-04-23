//Copyright 2020
// Created by nepla on 1/26/2021.
//

#include "Conversion.h"

int findMSB(int num) {
    bool neg = num < 0;
    num = (1 - neg) * (num) + neg * (~num + 1);
    num |= num >> 1;
    num |= num >> 2;
    num |= num >> 4;
    num |= num >> 8;
    num |= num >> 16;
    num = num + 1;
    return (1 - neg) * int(log2(num)) + neg * (int(log2(num)) + 1);
}

void Conversion::binaryToDecimal(std::bitset<32> m) {
    binary = m;
    decimal = (int)m.to_ulong();
    numOfBits = findMSB(decimal);
}

void Conversion::binaryToDecimal(std::string m) {
    binary = std::bitset<32>(m);
    decimal = (int)binary.to_ulong();
    numOfBits = findMSB(decimal);
}

void Conversion::decimalToBinary(int d) {
    std::bitset<32> e = std::bitset<32>(d);
    binary = e;
    decimal = d;
    numOfBits = findMSB(decimal);
}
