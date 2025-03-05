# Use official Golang image as a builder
FROM golang:1.20 AS builder

# Set the working directory
WORKDIR /app

# Copy the source code
COPY . .

# Download dependencies
RUN go mod tidy

# Build the Go application
RUN go build -o main .

# Use a minimal image for the final container
FROM alpine:latest

WORKDIR /root/

# Copy the compiled Go binary from the builder
COPY --from=builder /app/main .

# Expose the port your app runs on
EXPOSE 8080

# Run the Go app
CMD ["./main"]
