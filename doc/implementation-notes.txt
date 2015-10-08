
Implementation Notes for the Neuron Simulation, HTML5 Version
=============================================================

This simulation was ported from a Java version.  As such, there are a number of things that are done in the code that
would likely have been done in a very different manner if this had been written from scratch as JavaScript.  It is
important to keep this in mind when maintaining this code, since otherwise there are likely to be a lot of moments
where the maintainer is thinking things like, "Why the heck did they do this? I'm going to do it differently!", thus
ending up with a mish-mash of coding styles.

One particular area where this Java vs. JavaScript contrast is apparent is in the use of getters.  In the Java code,
there were many private variables that were accessed through getters.  For the most part, these getters were retained,
even though there is no such thing as a private member variable in JavaScript.  These getter functions look a little
weird in this context, but keeping them made the port easier.

This sim also uses a "clock adapter", which is a pattern that was frequently used to drive time-dependent behavior back
in the Java days.  It turned out to be a challenge to extricate this from the code, since it was coupled to the record-
and-playback behavior, so it was left in place.

This model portion of this simulation relies heavily on a model for the action potential called the Hodgkin–Huxley
model.  More information about this can be found here: https://en.wikipedia.org/wiki/Hodgkin%E2%80%93Huxley_model.

The simulation was originally ported from Java to HTML5 by an outside contractor, then reworked prior to be released,
which is yet another reason that any maintainer is likely to find a bit of a mix of coding styles.  It's fairly
consistent, but far from perfect in this regard.

Because this simulation consumes a fair amount of computational and graphical resources when an action potential is in
progress, there are a lot of optimizations.  As of this writing, there is a Web GL node that displays the sodium and
potassium ions, a canvas node for the membrance channels, and another canvas node for the traveling action potential.