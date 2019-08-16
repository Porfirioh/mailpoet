<?php

use Codeception\Event\SuiteEvent;
use Codeception\Event\TestEvent;
use Codeception\Events;
use Codeception\Extension;

class CleanupExtension extends Extension {
  const DB_BACKUP_PATH = __DIR__ . '/../_data/acceptanceBackup.sql';
  const DB_HOST = 'mysql';
  const DB_USERNAME = 'root';
  const DB_PASSWORD = 'wordpress';
  const DB_NAME = 'wordpress';

  static $events = [
    Events::SUITE_BEFORE => 'backupDatabase',
    Events::TEST_BEFORE => 'cleanupDatabase',
  ];

  /** @var PDO */
  private $root_connection;

  function __construct($config, $options) {
    parent::__construct($config, $options);
    $this->root_connection = new PDO($this->createDsnConnectionString(), self::DB_USERNAME, self::DB_PASSWORD);
    $this->root_connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  function backupDatabase(SuiteEvent $event) {
    exec($this->createMysqlDumpCommand());
    $sql = file_get_contents(self::DB_BACKUP_PATH);

    // wrap dump with SQL preserving user session ($I->login() reuses session snapshot for performance)
    $sql = "
      SELECT meta_value
      INTO @mp_meta_value
      FROM mp_usermeta
      WHERE user_id = 1
      AND meta_key = 'session_tokens';
      $sql
      DELETE FROM mp_usermeta WHERE meta_key = 'session_tokens';
      INSERT INTO mp_usermeta (user_id, meta_key, meta_value) VALUES (1, 'session_tokens', @mp_meta_value);
    ";

    // wrap SQL with serializable transaction (to avoid other connections like WP-CLI seeing wrong state)
    $sql = "
      SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
      START TRANSACTION;
      $sql
      COMMIT;
    ";

    file_put_contents(self::DB_BACKUP_PATH, $sql);
  }

  function cleanupDatabase(TestEvent $event) {
    $this->root_connection->exec(file_get_contents(self::DB_BACKUP_PATH));
  }

  private function createDsnConnectionString() {
    return sprintf(
      'mysql:host=%s;dbname=%s',
      self::DB_HOST,
      self::DB_NAME
    );
  }

  private function createMysqlDumpCommand() {
    return sprintf(
      'mysqldump --host=%s --user=%s --password=%s %s > %s',
      escapeshellarg(self::DB_HOST),
      escapeshellarg(self::DB_USERNAME),
      escapeshellarg(self::DB_PASSWORD),
      escapeshellarg(self::DB_NAME),
      escapeshellarg(self::DB_BACKUP_PATH)
    );
  }
}