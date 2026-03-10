const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

router.get('/get-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'get-docs.html'));
});

router.get('/post-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'post-docs.html'));
});

router.get('/donasi', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'donasi.html'));
});

router.get('/contributor', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'contributor.html'));
});

router.get('/stat', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'stat.html'));
});

router.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'support.html'));
});

router.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'tos.html'));
});

module.exports = router;