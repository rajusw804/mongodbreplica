#!/bin/bash

# Run mongosh to initiate the replica set
mongosh --host 192.168.61.29 --eval 'rs.initiate({_id: "myReplicaSet", members: [{ _id: 0, host: "192.168.61.29:27017" }, { _id: 1, host: "192.168.61.66:27016" }]})'
