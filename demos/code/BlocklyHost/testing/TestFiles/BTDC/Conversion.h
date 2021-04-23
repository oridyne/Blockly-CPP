//Copyright 2020
// Created by nepla on 1/26/2021.
//

#ifndef BTDDTB_CONVERSION_H
#define BTDDTB_CONVERSION_H

#include <bits/stdc++.h>
#include <iostream>
class Conversion {
private:
    std::bitset<32> binary;  // store the binary value
    int decimal;            // store the decimal value
    int numOfBits;        // minimum number of bits to store the binary value

public:
    void binaryToDecimal(std::bitset<32> m);  // set binary, decimal, and number of bits to the instant variables
    void binaryToDecimal(std::string m);  // set binary, decimal, and number of bits to the instant variables
    void decimalToBinary(int d);  // set binary, decimal, and number of bits to the instant variables
    std::bitset<32> getBinary() {
        return binary;
    }
    int getDecimal() {
        return decimal;
    }
    int getNumBits() {
        return numOfBits;
    }

};


#endif //BTDDTB_CONVERSION_H
