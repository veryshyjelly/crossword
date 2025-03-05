#!/bin/bash
go mod tidy
go build -o app .
./app
