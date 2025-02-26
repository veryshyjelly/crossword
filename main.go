package main

import (
	"crossword/db"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/publishers", Publishers)
	http.HandleFunc("/dates", Dates)
	http.HandleFunc("/puzzle", Puzzle)
	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
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
