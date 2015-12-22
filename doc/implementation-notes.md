
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

When the code was first submitted to PhET, there were a number of places where events were signalled by toggling a
boolean Property instead of simply triggering an event.  It's hard to say why this was done, but it may just be that
the original author wasn't familiar with events.  Some of these were changed to be events, but there wasn't a concerted
effort to change them all, so there may still be some instances of this pattern (or perhaps "anti-pattern") in the code.

Because this simulation consumes a fair amount of computational and graphical resources when an action potential is in
progress, there are a lot of optimizations.  As of this writing, there is a WebGL node that displays the sodium and
potassium ions, a canvas node for the membrane channels, and another canvas node for the traveling action potential.

The code to implement the playback and record feature is a little tricky, so it's worth saying a few words about it.  It
was originally written in Java, and as such it made heavy use of inheritance.  The key base classes are "Mode" and
"RecordAndPlaybackModel".  A mode represents the current playback mode, and different modes are switched in and out as
the playback mode changes.  There are currently three modes: Record, Playback, and Live.  The first two are fairly self
explanatory, and the third is a mode where the simulation is running and no recording is taking place. The mode
instances are switched in and out as the playback mode changes in order to implement the desired behavior.  This is
similar to the "State Pattern" often used in OO design, and more information can be found here: 
https://en.wikipedia.org/wiki/State_pattern. 

Finally, there is some inconsistency in the quality of the comments.  Many have been edited and cleaned up, but this
process was time consuming and didn't seem to add a lot of value, so some have been left as they were when the
simulation was delivered.  Feel free to clean them up as they are encountered during any maintenance work.
