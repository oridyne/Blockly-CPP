#ifndef NEWCXXTEST_H
#define NEWCXXTEST_H


#include "C:/cygwin64/cxxtest/cxxtest/TestSuite.h"
#include "code0x5df321a476c00000.h"

class newCxxTest : public CxxTest::TestSuite {
    public:
    void testAddNumbers() {
        int sum = addNumbers(1, 2);
        TS_ASSERT(sum == 3);
    }

};

#endif //NEWCXXTEST_H
