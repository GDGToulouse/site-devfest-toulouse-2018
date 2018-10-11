#!/usr/bin/env bash


# You should have a ./serviceAccount.json file
# see https://cloud.google.com/docs/authentication/production#auth-cloud-implicit-nodejs

collections=(blog
             partners
             schedule
             sessions
             speakers
             team
             tickets
             videos)

yarn firebase use sandbox-devfesttoulouse

for col in "${collections[@]}"
do :
  yarn firebase firestore:delete -r -y ${col}
done

yarn firestore:ci:update
