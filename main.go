package main

import (
	"crossword/db"
	"encoding/json"
	"fmt"
	"net/http"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins (change "*" to a specific origin if needed)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests (OPTIONS method)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	// Wrap the handler with CORS middleware
	handler := enableCORS(mux)

	fmt.Println("Server running on :8080")

	mux.HandleFunc("/publishers", Publishers)
	mux.HandleFunc("/dates", Dates)
	mux.HandleFunc("/puzzle", Puzzle)
	fmt.Println("Server started at http://localhost:8080")

	http.ListenAndServe(":8080", handler)
}

func Publishers(w http.ResponseWriter, r *http.Request) {
	pubs, err := db.GetPublishers()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(pubs)
}

func Dates(w http.ResponseWriter, r *http.Request) {
	pub := r.URL.Query().Get("publisher")
	dates, err := db.GetDates(pub)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dates)
}

func Puzzle(w http.ResponseWriter, r *http.Request) {
	pub := r.URL.Query().Get("publisher")
	date := r.URL.Query().Get("date")
	puz, err := db.GetPuzzle(pub, date)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(puz)
}
