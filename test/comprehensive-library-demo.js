#!/usr/bin/env node

/**
 * Comprehensive Library System Demo Script
 * Tests all enhanced library features including digital resources, media library, AI tools, and analytics
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

class LibrarySystemDemo {
  constructor() {
    this.authToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async run() {
    console.log('🚀 Starting Comprehensive Library System Demo...\n');
    
    try {
      await this.setup();
      await this.testPhysicalLibrary();
      await this.testDigitalLibrary();
      await this.testMediaLibrary();
      await this.testAIFeatures();
      await this.testAdvancedFeatures();
      await this.testAnalytics();
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async setup() {
    console.log('📋 Setting up demo environment...');
    
    // Test server health
    await this.testEndpoint('GET', '/health', null, 'Server Health Check');
    
    // Authenticate as admin
    const loginResponse = await this.testEndpoint('POST', '/auth/login', {
      email: 'admin@library.com',
      password: 'admin123'
    }, 'Admin Authentication');
    
    if (loginResponse && loginResponse.token) {
      this.authToken = loginResponse.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      console.log('✅ Authenticated as admin\n');
    }
  }

  async testPhysicalLibrary() {
    console.log('📚 Testing Physical Library Management...');
    
    // Test existing book endpoints
    await this.testEndpoint('GET', '/api/books', null, 'Fetch All Books');
    
    // Test borrowing functionality
    const borrowData = {
      userId: 1,
      bookId: 1,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
    await this.testEndpoint('POST', '/api/borrow-records', borrowData, 'Create Borrow Record');
    
    // Test return functionality
    await this.testEndpoint('GET', '/api/borrow-records', null, 'Fetch Borrow Records');
    
    console.log('');
  }

  async testDigitalLibrary() {
    console.log('💻 Testing Digital E-Library...');
    
    // Test digital resources
    await this.testEndpoint('GET', '/api/library/digital-resources', null, 'Fetch Digital Resources');
    
    // Test digital resource creation
    const digitalResource = {
      title: 'Introduction to Machine Learning',
      description: 'Comprehensive guide to ML fundamentals',
      author: 'Dr. Jane Smith',
      subject: 'Computer Science',
      isbn: '978-0123456789',
      format: 'pdf',
      file_size: 5242880, // 5MB
      language: 'en',
      publication_date: '2024-01-15',
      metadata: {
        pages: 350,
        edition: '2nd',
        publisher: 'Tech Publications'
      },
      access_level: 'public',
      drm_enabled: true
    };
    
    await this.testEndpoint('POST', '/api/library/digital-resources', digitalResource, 'Create Digital Resource');
    
    // Test search functionality
    await this.testEndpoint('GET', '/api/library/digital-resources/search?q=machine learning', null, 'Search Digital Resources');
    
    // Test format filtering
    await this.testEndpoint('GET', '/api/library/digital-resources?format=pdf', null, 'Filter by Format');
    
    console.log('');
  }

  async testMediaLibrary() {
    console.log('🎬 Testing Media Library...');
    
    // Test media resources
    await this.testEndpoint('GET', '/api/library/media-resources', null, 'Fetch Media Resources');
    
    // Test media resource creation
    const mediaResource = {
      title: 'Physics Fundamentals Lecture Series',
      description: 'Complete physics course video lectures',
      creator: 'Prof. John Doe',
      type: 'lecture',
      genre: 'education',
      duration_seconds: 3600, // 1 hour
      format: 'mp4',
      resolution: '1080p',
      file_size: 104857600, // 100MB
      language: 'en',
      subtitles_available: true,
      external_url: 'https://youtube.com/watch?v=example',
      metadata: {
        series: 'Physics 101',
        episode: 1,
        instructor: 'Prof. John Doe',
        university: 'Tech University'
      },
      access_level: 'public',
      streaming_enabled: true
    };
    
    await this.testEndpoint('POST', '/api/library/media-resources', mediaResource, 'Create Media Resource');
    
    // Test media search
    await this.testEndpoint('GET', '/api/library/media-resources/search?q=physics', null, 'Search Media Resources');
    
    // Test streaming functionality
    await this.testEndpoint('GET', '/api/library/media-resources/1/stream', null, 'Media Streaming Endpoint');
    
    console.log('');
  }

  async testAIFeatures() {
    console.log('🤖 Testing AI-Powered Features...');
    
    // Test intelligent search
    const searchQuery = {
      query: 'machine learning algorithms for beginners',
      type: 'mixed',
      limit: 10,
      include_metadata: true
    };
    
    await this.testEndpoint('POST', '/api/library/ai/search', searchQuery, 'AI-Powered Intelligent Search');
    
    // Test recommendations
    const recommendationRequest = {
      user_id: 1,
      type: 'mixed',
      algorithm: 'hybrid',
      limit: 5
    };
    
    await this.testEndpoint('POST', '/api/library/ai/recommend', recommendationRequest, 'AI Recommendations');
    
    // Test chat assistant
    const chatMessage = {
      message: 'Can you help me find books about artificial intelligence?',
      context: 'general',
      user_id: 1
    };
    
    await this.testEndpoint('POST', '/api/library/ai/chat', chatMessage, 'AI Chat Assistant');
    
    // Test content summarization
    const summaryRequest = {
      resource_id: 1,
      resource_type: 'digital',
      summary_type: 'brief'
    };
    
    await this.testEndpoint('POST', '/api/library/ai/summarize', summaryRequest, 'AI Content Summarization');
    
    // Test translation
    const translationRequest = {
      text: 'This is a sample text for translation',
      source_language: 'en',
      target_language: 'es'
    };
    
    await this.testEndpoint('POST', '/api/library/ai/translate', translationRequest, 'AI Translation Service');
    
    console.log('');
  }

  async testAdvancedFeatures() {
    console.log('⚡ Testing Advanced Features...');
    
    // Test collections
    await this.testEndpoint('GET', '/api/library/collections', null, 'Fetch Collections');
    
    const newCollection = {
      name: 'AI and Machine Learning Resources',
      description: 'Curated collection of AI/ML books and videos',
      type: 'subject',
      is_public: true,
      metadata: {
        subject: 'Computer Science',
        difficulty_level: 'intermediate'
      }
    };
    
    await this.testEndpoint('POST', '/api/library/collections', newCollection, 'Create Collection');
    
    // Test reservations
    await this.testEndpoint('GET', '/api/library/reservations', null, 'Fetch Reservations');
    
    const newReservation = {
      user_id: 1,
      resource_id: 1,
      resource_type: 'book',
      reserved_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    await this.testEndpoint('POST', '/api/library/reservations', newReservation, 'Create Reservation');
    
    // Test waitlists
    await this.testEndpoint('GET', '/api/library/waitlists', null, 'Fetch Waitlists');
    
    // Test fines
    await this.testEndpoint('GET', '/api/library/fines', null, 'Fetch Fines');
    await this.testEndpoint('GET', '/api/library/fines/summary', null, 'Fines Summary');
    
    console.log('');
  }

  async testAnalytics() {
    console.log('📊 Testing Analytics & Reporting...');
    
    // Test dashboard analytics
    await this.testEndpoint('GET', '/api/library/analytics/dashboard', null, 'Dashboard Analytics');
    
    // Test usage analytics
    await this.testEndpoint('GET', '/api/library/analytics/usage', null, 'Usage Analytics');
    
    // Test popular resources
    await this.testEndpoint('GET', '/api/library/analytics/popular', null, 'Popular Resources');
    
    // Test user activity
    await this.testEndpoint('GET', '/api/library/analytics/user-activity', null, 'User Activity Analytics');
    
    // Test resource performance
    await this.testEndpoint('GET', '/api/library/analytics/resource-performance', null, 'Resource Performance');
    
    // Test trend analysis
    await this.testEndpoint('GET', '/api/library/analytics/trends', null, 'Trend Analysis');
    
    console.log('');
  }

  async testEndpoint(method, endpoint, data, description) {
    this.testResults.total++;
    
    try {
      const url = endpoint.startsWith('/api') ? `${BASE_URL}${endpoint}` : `${API_BASE}${endpoint}`;
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(url);
          break;
        case 'post':
          response = await axios.post(url, data);
          break;
        case 'put':
          response = await axios.put(url, data);
          break;
        case 'delete':
          response = await axios.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      if (response.status >= 200 && response.status < 300) {
        this.testResults.passed++;
        console.log(`✅ ${description}`);
        this.testResults.details.push({
          test: description,
          status: 'PASSED',
          endpoint: endpoint,
          method: method,
          responseStatus: response.status
        });
        return response.data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.testResults.failed++;
      console.log(`❌ ${description} - ${error.message}`);
      this.testResults.details.push({
        test: description,
        status: 'FAILED',
        endpoint: endpoint,
        method: method,
        error: error.message
      });
      return null;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE LIBRARY SYSTEM DEMO SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.test}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 Demo completed! The comprehensive library system includes:');
    console.log('  📚 Physical Library Management (RFID, Barcode, Self-Service)');
    console.log('  💻 Digital E-Library (PDF, EPUB, DRM, Full-text Search)');
    console.log('  🎬 Media Library (Audio, Video, Streaming, External URLs)');
    console.log('  🤖 AI-Powered Tools (Smart Search, Recommendations, Chat, Translation)');
    console.log('  ⚡ Advanced Features (Collections, Reservations, Waitlists, Fines)');
    console.log('  📊 Analytics & Reporting (Usage Trends, Performance Metrics)');
    console.log('\n' + '='.repeat(60));
  }
}

// Run the demo
if (require.main === module) {
  const demo = new LibrarySystemDemo();
  demo.run().catch(console.error);
}

module.exports = LibrarySystemDemo;