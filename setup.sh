#!/bin/bash

# Export the cms-platform database to a dump folder
echo "Exporting MongoDB database 'cms-platform'..."
mongodump --db=cms-platform --out=./cms-platform-dump

echo "✅ Database exported to ./cms-platform-dump"
echo "Next, copy the folder to your VM using scp:"
echo "scp -r ./cms-platform-dump cdac-mag1@10.244.0.147:~/"