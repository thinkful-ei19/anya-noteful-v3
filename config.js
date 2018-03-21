'use strict';

exports.PORT = process.env.PORT || 8080;
//exports.TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/noteful-app-test';
exports.TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost/test-restaurants-app';
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/noteful-app';