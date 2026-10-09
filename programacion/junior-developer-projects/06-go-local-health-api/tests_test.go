package main
import("net/http/httptest";"testing")
func TestHealth(t *testing.T){r:=httptest.NewRequest("GET","/health",nil);w:=httptest.NewRecorder();health(w,r);if w.Code!=200{t.Fatalf("status=%d",w.Code)};if got:=w.Header().Get("Content-Type");got!="application/json"{t.Fatalf("content-type=%q",got)}}
func TestHealthRejectsPost(t *testing.T){r:=httptest.NewRequest("POST","/health",nil);w:=httptest.NewRecorder();health(w,r);if w.Code!=405{t.Fatalf("status=%d",w.Code)}}
