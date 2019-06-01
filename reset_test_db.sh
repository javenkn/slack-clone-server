#! /bin/bash
dropdb test_slack
createdb test_slack
psql test_slack < dump.sql #! used for saving users