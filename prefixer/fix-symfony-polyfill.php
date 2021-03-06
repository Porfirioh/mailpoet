<?php

// throw exception if anything fails
set_error_handler(function ($severity, $message, $file, $line) {
  throw new ErrorException($message, 0, $severity, $file, $line);
});

$file = __DIR__ . '/../vendor-prefixed/symfony/polyfill-intl-idn/Idn.php';
$data = file_get_contents($file);
$data = str_replace('use Normalizer;', 'use MailPoetVendor\\Normalizer;', $data);
file_put_contents($file, $data);
