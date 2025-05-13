#!/bin/bash

# Connect to MongoDB and obtain the current replica set configuration
current_cfg=$(mongosh --host 192.168.61.29 --quiet --eval 'rs.conf()')

# Prepare the updated configuration with priority settings
updated_cfg=$(echo "$current_cfg" | sed 's/\("host": "192.168.61.29:27017",$"priority": [0-9]/\1"priority": 2/' | \
                                 sed 's/\("host": "192.168.61.66:27016",$"priority": [0-9]/\1"priority": 1/')

# Apply the updated replica set configuration
mongosh --host 192.168.61.29 --quiet --eval "rs.reconfig($updated_cfg)"

# Output the status of the replica set to verify changes
mongosh --host 192.168.61.29 --quiet --eval 'rs.status()'
