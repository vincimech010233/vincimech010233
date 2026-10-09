package main

import (
 "encoding/json"
 "log"
 "net/http"
 "os"
 "time"
)
type response struct { Status string `json:"status"`; Time string `json:"time,omitempty"` }
func health(w http.ResponseWriter, r *http.Request) {
 if r.Method != http.MethodGet { http.Error(w,"method not allowed",http.StatusMethodNotAllowed); return }
 w.Header().Set("Content-Type","application/json")
 _ = json.NewEncoder(w).Encode(response{Status:"ok",Time:time.Now().UTC().Format(time.RFC3339)})
}
func ready(w http.ResponseWriter,r *http.Request){w.Header().Set("Content-Type","application/json"); _=json.NewEncoder(w).Encode(response{Status:"ready"})}
func main(){
 mux:=http.NewServeMux(); mux.HandleFunc("/health",health); mux.HandleFunc("/ready",ready)
 addr:="127.0.0.1:"+os.Getenv("PORT"); if os.Getenv("PORT")=="" {addr="127.0.0.1:8080"}
 server:=&http.Server{Addr:addr,Handler:logRequests(mux),ReadHeaderTimeout:3*time.Second}
 log.Printf("listening on http://%s",addr); log.Fatal(server.ListenAndServe())
}
func logRequests(next http.Handler) http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){log.Printf("%s %s",r.Method,r.URL.Path);next.ServeHTTP(w,r)})}
