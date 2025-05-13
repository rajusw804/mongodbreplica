#!/bin/bash

# Connect to MongoDB and retrieve the current replica set configuration
cfg=$(mongosh --host 192.168.61.29 --quiet --eval 'JSON.stringify(rs.conf())')

# Update the configuration priorities to set primary and secondary
updated_cfg=$(echo "$cfg" | jq '(.members[] | select(.host == "192.168.61.29:27017").priority) |= 2 | 
                                  (.members[] | select(.host == "192.168.61.66:27016").priority) |= 1')

# Reconfigure the replica set with updated priorities
mongosh --host 192.168.61.29 --eval "rs.reconfig($updated_cfg)"

# Verify the status to confirm the changes
mongosh --host 192.168.61.29 --eval 'rs.status()'
