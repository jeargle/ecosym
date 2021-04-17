ecosym
======

Ecosystem simulator inspired by *A Primer of Ecology* by Nicholas J. Gotelli.


General
-------

ecosym runs basic ecosystem models, e.g. population dynamics under exponential or logistic growth, and plots population over time.  Multiple models can be active at once, and you can tweak the model parameters to see how they affect things.


Ecosystem Models
----------------

1. Continuous exponential
2. Discrete exponential
3. Environmentally stochastic
4. Demographically stochastic
5. Continuous logistic
6. Continuous logistic with stochastic carrying capacity
7. Continuous logistic with periodic carrying capacity
8. Discrete logistic


How to Run
----------

ecosym runs in web browsers and needs to be hosted by a webserver.  To host it, start up a webserver that gives access to the index.html file within the ecosym top-level directory.  For example, if you have python (>=3) installed, navigate to the ecosym directory and run

```
> python -m http.server 8000
```

This will start a server exposing that directory on port 8000.  You can then access the program by pointing your web browser to the URL `http://localhost:8000`.


Dependencies
------------

The external dependencies are currently linked from [cdnjs.com](https://cdnjs.com).

1. jQuery
2. underscore
3. plotly
4. d3 (from [d3js.org](https://d3js.org))
5. Font Awesome
