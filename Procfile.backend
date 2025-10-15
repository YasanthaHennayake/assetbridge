# Heroku Procfile
#
# This file tells Heroku how to run your application.
# Each line defines a process type and the command to run it.
#
# Format: <process type>: <command>
#
# Process type 'web' is special:
# - Receives HTTP traffic
# - Heroku assigns a PORT environment variable
# - Must bind to the PORT within 60 seconds or Heroku will restart it
#
# This command:
# 1. Changes directory to the backend package
# 2. Runs 'npm start' which executes the compiled JavaScript

web: cd packages/backend && npm start
