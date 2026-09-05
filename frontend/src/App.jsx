import React from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Methodology from "./pages/Methodology";
import ApiDocs from "./pages/ApiDocs";
import ESankhyiki from "./pages/ESankhyiki";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/api" component={ApiDocs} />
      <Route path="/esankhyiki" component={ESankhyiki} />
      <Route component={NotFound} />
    </Switch>
  );
}
