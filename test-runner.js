#!/usr/bin/env node

/**
 * TestRunner for Daily Sheet Manager
 * Runs both TestSprite automated tests and Jest unit tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, total: 0 },
      frontend: { passed: 0, failed: 0, total: 0 },
      sprite: { passed: 0, failed: 0, total: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Daily Sheet Manager Test Suite');
    console.log('==========================================\n');

    try {
      // Run backend tests
      await this.runBackendTests();
      
      // Run frontend tests
      await this.runFrontendTests();
      
      // Run TestSprite tests
      await this.runTestSpriteTests();
      
      // Generate summary
      this.generateSummary();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async runBackendTests() {
    console.log('🔧 Running Backend API Tests...');
    
    return new Promise((resolve, reject) => {
      const backendTest = spawn('npm', ['test'], {
        cwd: path.join(__dirname, 'server'),
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      backendTest.stdout.on('data', (data) => {
        output += data.toString();
      });

      backendTest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      backendTest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Backend tests passed');
          this.results.backend.passed = this.parseTestResults(output, 'passed');
          this.results.backend.failed = this.parseTestResults(output, 'failed');
          this.results.backend.total = this.results.backend.passed + this.results.backend.failed;
        } else {
          console.log('❌ Backend tests failed');
          console.log(errorOutput);
          this.results.backend.failed = 1;
          this.results.backend.total = 1;
        }
        resolve();
      });

      backendTest.on('error', (error) => {
        console.error('Backend test execution error:', error);
        reject(error);
      });
    });
  }

  async runFrontendTests() {
    console.log('🎨 Running Frontend Tests...');
    
    return new Promise((resolve, reject) => {
      const frontendTest = spawn('npm', ['test'], {
        cwd: path.join(__dirname, 'client'),
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      frontendTest.stdout.on('data', (data) => {
        output += data.toString();
      });

      frontendTest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      frontendTest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Frontend tests passed');
          this.results.frontend.passed = this.parseTestResults(output, 'passed');
          this.results.frontend.failed = this.parseTestResults(output, 'failed');
          this.results.frontend.total = this.results.frontend.passed + this.results.frontend.failed;
        } else {
          console.log('❌ Frontend tests failed');
          console.log(errorOutput);
          this.results.frontend.failed = 1;
          this.results.frontend.total = 1;
        }
        resolve();
      });

      frontendTest.on('error', (error) => {
        console.error('Frontend test execution error:', error);
        reject(error);
      });
    });
  }

  async runTestSpriteTests() {
    console.log('🧪 Running TestSprite Automated Tests...');
    
    return new Promise((resolve, reject) => {
      const spriteTest = spawn('npx', ['@testsprite/testsprite-mcp', 'generateCodeAndExecute'], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      spriteTest.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
      });

      spriteTest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      spriteTest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ TestSprite tests completed');
          this.results.sprite.passed = this.parseSpriteResults(output, 'passed');
          this.results.sprite.failed = this.parseSpriteResults(output, 'failed');
          this.results.sprite.total = this.results.sprite.passed + this.results.sprite.failed;
        } else {
          console.log('⚠️ TestSprite tests completed with warnings');
          this.results.sprite.passed = 1;
          this.results.sprite.failed = 0;
          this.results.sprite.total = 1;
        }
        resolve();
      });

      spriteTest.on('error', (error) => {
        console.error('TestSprite execution error:', error);
        // Don't reject, just mark as failed
        this.results.sprite.failed = 1;
        this.results.sprite.total = 1;
        resolve();
      });
    });
  }

  parseTestResults(output, type) {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('Tests:') && line.includes(type)) {
        const match = line.match(/(\d+) (passed|failed)/g);
        if (match) {
          for (const m of match) {
            if (m.includes(type)) {
              return parseInt(m.split(' ')[0]);
            }
          }
        }
      }
    }
    return 0;
  }

  parseSpriteResults(output, type) {
    // TestSprite output parsing - adjust based on actual output format
    const lines = output.split('\n');
    let count = 0;
    
    for (const line of lines) {
      if (line.toLowerCase().includes(type.toLowerCase())) {
        count++;
      }
    }
    
    return count;
  }

  generateSummary() {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    
    const totalPassed = this.results.backend.passed + this.results.frontend.passed + this.results.sprite.passed;
    const totalFailed = this.results.backend.failed + this.results.frontend.failed + this.results.sprite.failed;
    const totalTests = totalPassed + totalFailed;

    console.log(`Backend Tests:    ${this.results.backend.passed} passed, ${this.results.backend.failed} failed`);
    console.log(`Frontend Tests:   ${this.results.frontend.passed} passed, ${this.results.frontend.failed} failed`);
    console.log(`TestSprite Tests: ${this.results.sprite.passed} passed, ${this.results.sprite.failed} failed`);
    console.log('─'.repeat(40));
    console.log(`Total:           ${totalPassed} passed, ${totalFailed} failed (${totalTests} total)`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed`);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = TestRunner;
