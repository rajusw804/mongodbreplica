#!/bin/bash

# Run this script with root privileges
# Usage: sudo bash setup-mongodb.sh

set -e

# Variables
MONGO_USER="mongodb"
MONGO_GROUP="mongodb"
MONGO_DIR="/var/lib/mongodb"
MONGO_LOG_DIR="/var/log/mongodb"
MONGO_CONF_FILE="/etc/mongod.conf"
REPLICA_SET_NAME="myReplicaSet"
MONGO_VERSION="6.0"
UBUNTU_VERSION="jammy"  # Change if using another version, e.g., focal

# Function to install MongoDB
install_mongodb() {
    echo "Updating package index..."
    sudo apt update

    echo "Importing MongoDB public GPG key..."
    curl -fsSL https://pgp.mongodb.com/server-$MONGO_VERSION.asc | sudo tee /etc/apt/trusted.gpg.d/mongodb-server-$MONGO_VERSION.asc > /dev/null

    echo "Creating MongoDB source list file..."
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $UBUNTU_VERSION/mongodb-org/$MONGO_VERSION multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-$MONGO_VERSION.list

    echo "Updating package index to add MongoDB repository..."
    sudo apt update

    echo "Installing MongoDB..."
    sudo apt install -y mongodb-org mongodb-mongosh
    sudo sed -i '/^#replication:/c\replication:\n  replSetName: myReplicaSet' /etc/mongod.conf
    sudo sed -i '/^#security:/c\security:\n  authorization: enabled' /etc/mongod.conf
}

# Start and enable MongoDB service
setup_mongodb_service() {
    echo "Starting MongoDB service..."
    sudo systemctl start mongod

    echo "Enabling MongoDB service to start on boot..."
    sudo systemctl enable mongod

    echo "Checking MongoDB service status..."
    sudo systemctl status mongod

    echo "MongoDB installation and setup complete!"
}

# Create MongoDB User and Group if they don't exist
create_mongo_user() {
    if ! id "$MONGO_USER" &>/dev/null; then
        echo "Creating mongodb user..."
        sudo useradd -r -s /bin/false "$MONGO_USER"
    else
        echo "User mongodb already exists."
    fi
}

# Setup Directories and Permissions
setup_directories() {
    echo "Setting up directories..."
    sudo mkdir -p "$MONGO_DIR"
    sudo mkdir -p "$MONGO_LOG_DIR"
    sudo chown -R "$MONGO_USER":"$MONGO_GROUP" "$MONGO_DIR"
    sudo chown -R "$MONGO_USER":"$MONGO_GROUP" "$MONGO_LOG_DIR"
}

# Initialize Replica Set
initialize_replica_set() {
    echo "Initializing Replica Set..."
    mongosh --host 192.168.61.29 --eval "rs.initiate({ 
        _id: '$REPLICA_SET_NAME', 
        members: [
            { _id: 0, host: '192.168.61.29:27017' },
            { _id: 1, host: '192.168.61.66:27017' }
        ]
    })"
}

# Starting MongoDB as root (for testing only)
start_mongodb_as_root() {
    echo "Starting MongoDB as root..."
    sudo mongod --config "$MONGO_CONF_FILE" &
    echo "MongoDB started as root."
}

# Main Function
main() {
    install_mongodb
    setup_mongodb_service
    create_mongo_user
    setup_directories
    initialize_replica_set

    # Optionally start MongoDB as root for testing purposes
    echo "Do you want to start MongoDB as root for testing? [y/N]"
    read -r RESPONSE
    if [[ "$RESPONSE" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        start_mongodb_as_root
    else
        echo "MongoDB service has been started normally. Use 'sudo systemctl start mongod' to start the service."
    fi
}

# Run the script
main