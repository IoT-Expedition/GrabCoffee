Editing Uploading Alexa Skills to AWS server
============================================

Alexa Skills Kit is a voice interaction service offered by Amazon. It is
used through the Amazon Echo Device.
https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit

Lambda Function refers to the Node.js function located in AWS Lambda.
The function can be written in Node.js or Java.
https://console.aws.amazon.com/lambda

The Alexa Skill is the Skill that we create that specifies the type of
commands, their structure, number of inputs, sample utterances of the
commands, etc. https://developer.amazon.com/edw/home.html#/

When we wake Alexa using the "Wake Word" (either "Alexa" or "Amazon",
which can be changed in the Alexa Phone Application settings), it starts
to stream the audio to the Alexa Skill for voice recognition. Once the
command given by the User is identified, it sends a JSON Request to the
Lambda Function, specifying the type of command. The Lambda Function
processes the request as required, connecting to the Database or any
other Web Services, and it formats a Response. The response must have a
SpeechText which is the text that the Echo Device responds with. The
Lambda Function can also send an optional Card that is sent to the Alexa
Mobile Application. This can be used to present more detailed
information that is too complex for the Echo Device to just talk back.
The Lambda Function sends this response to the Alexa Service which
automatically sends it back to the Echo Device which speaks the text it
received as the SpeechText. This response is of two types, it can either
"Ask" or "Tell": Tell means it can either just say the response and end
its session and to interact again we need to invoke it again. Ask means
it can give the response and wait for the user's next command to
proceed.

This is the general working of the Alexa Skill. In this, we develop the
Lambda Function that processes the request of the user and formats the
response. The Speech-to-Text and Text-to-Speech part is automated so we
need not worry about that. This function needs to be created/edited in
the local machine either in a Text Editor/IDE.

By now the following terms should be clear: Alexa Skill Lambda Function
Amazon Echo Device

.. figure:: https://lh5.googleusercontent.com/jUswUfIXG6t81HK4YaZee0P3W9jvWaASQJMGp9nM5LDJnDwOicQ7BZHu3SeoyrfokfdvJnpVG6SoFPp54Ag_jNkh1VGLUUeK-fPwtaju19nK033r7WbSC9x0SLEI6dk4A7xnJ0qJDmy5WDOqAw
   :alt: alt tag

   alt tag

The Lambda Function Homepage. Choose which Lambda Function which you
need to change or you can create a new Function also.

.. figure:: https://lh5.googleusercontent.com/jUswUfIXG6t81HK4YaZee0P3W9jvWaASQJMGp9nM5LDJnDwOicQ7BZHu3SeoyrfokfdvJnpVG6SoFPp54Ag_jNkh1VGLUUeK-fPwtaju19nK033r7WbSC9x0SLEI6dk4A7xnJ0qJDmy5WDOqAw
   :alt: alt tag

   alt tag

This is the page of the selected Lambda Function. Here you can Upload
new code for the function Change configurations of the function Edit the
Event Sources Test the Lambda Function by giving it sample inputs and
view the execution results of the Lambda Function. Identify syntax
errors or logical errors through the "Log output" section.

.. figure:: https://photos-1.dropbox.com/t/2/AAAJYN6dnv3EGBasOiUwZeuA-WS1m6cj4puDXdgWtTAOIw/12/105186450/png/32x32/1/_/1/2/Screen%20Shot%202016-03-27%20at%206.06.51%20PM.png/EN_LtlEYm7t5IAIoAg/ZP8A4MdqgaXKes5PCkNnYenPTld2J3hep0gvPexoymY?size=1024x768&size_mode=3
   :alt: alt tag

   alt tag

The Execution result section shows the JSON Response of the Lambda
function. The SpeechText and the Card details can be viewed in this.
Also the session\_attributes that are used in the function are
displayed.

The Log output section shows the text that we log in the code and if
there is an error in the Lambda Function, it will be displayed here with
the Line number for easy identification of the error.

The Summary section mainly shows that Duration of Execution and the
memory used for the execution.

.. figure:: https://lh3.googleusercontent.com/4C635ydN1CwhTlUa8Z4NtgIj5iMtZ4KKL_ZCcFnBYmyI4G4Z_N-LWcUmcpLf5KmNBWKBtfTTxUvVaTFD1hNUnlb6B21ILTcPh-KEom2g1Vvw3KJKzarCKoVp2SYHpWpqi4BoNTNqb-uR0iBVbw
   :alt: alt tag

   alt tag

By clicking "Actions" button near the "Test" button, and choosing "edit
sample event" the above screen is displayed. We can edit the JSON
request that is sent to the Lambda Function and change the Intent, slots
for the intent, etc.

.. figure:: https://lh5.googleusercontent.com/frONBqOE5_NPC4UVSRZDfn3zjhOAj00fPKFIn28fos1ADv2EdhgDwobkYOUKiOx7mksYnTS9smy74pBXNv0SOgiucquYUjC2x6JKRIog5UHzRi6HxfNT5rSz3g5CjzcEkVcv7Sdw6TfzagMggQ
   :alt: alt tag

   alt tag

This is the configuration window. Here we can specify different roles
for the Function to give it more access to other AWS Functionalities.
(Not important right now)

.. figure:: https://lh3.googleusercontent.com/F0PCrWTYYyL0k4_jC7KqgNKWlH9Saah4LRb9osia8jpJge_T9fcz5q_wkokLOUtmVdt7X22_p-oqaQ-D-vtZstIcM2BdbklmgI-3At0p58KnehS8xc6MOOuqmvHBgcDxhu1QXm3b2ltSZ-tsmg
   :alt: alt tag

   alt tag

This screen displays the Event sources for the Lambda Function. Without
giving the Alexa Skills Kit event source, you will not be able to link
the Alexa Skill with this Lambda Function.

.. figure:: https://lh4.googleusercontent.com/r7Y2Q4EyK4lrS01VOensyhl2JfpNzgICVP3ECYH5U-_gpJzntglcBl7b9EdXeKI_B7-EJoeFgXiykzfYX3JePI24mRj11Jc9x7znvOrANVoFybAIwJJ5wyYV2GFRqm9FqWAzuBT9_bjk-QJPqA
   :alt: alt tag

   alt tag

This is the homepage of the Alexa Skills Kit. We need to choose "Get
Started >" on the Alexa Skills Kit.

.. figure:: https://lh4.googleusercontent.com/3KZr5p6MLFtcHgUpY8LrJkbkqwXxvy7X3oesKClIk_246jP8GmHsHu5e2Z7K49yzw0tQWK6OPxx4rdLuJzDA8ARP79kXKiWOgcY36spgxCREsI-GkTlpkGR6CySjicfo4jG7nQcM-BUbdUz5qg
   :alt: alt tag

   alt tag

This page lists all the Alexa Skills that our account currently has (For
now just 1). Choose Edit to change the Skill.

.. figure:: https://lh4.googleusercontent.com/JDMP6Jta2nZciUv6grRQ1wSRtHYsTNd7qLbE3U1OAPE2WEEvCHYLfSVUd0lSThUjPvsW1NF1D6dbtrlgVuFBLggWVcgJYV8ODGmtPjr9goH_fBlfB_vIqE0wZGX2c7ScMR0gvs6S-1Jy1RkZEw
   :alt: alt tag

   alt tag

This is the Skill Information page of the selected skill. Here the name,
version, etc. are displayed. The Invocation name means the name that is
used to call the function by the User. The Endpoint must specify the
Lambda Function that is associated with this Skill.

.. figure:: https://lh5.googleusercontent.com/TKWwij6biJxMBkoYqql56Qtpka_aeZlcsHSz3O926ISSMyvn-QgUNX2dHc6AZ1E4fCJj9slyUmkq-dSfdUu9k9yuDEbeFxUY9I-ObkXzbfFQAWOMeWBaqC6Oznpmf3Yi5ddIbnqyY78KlHjddg
   :alt: alt tag

   alt tag

This page shows the Intent Schema section. We need to specify a schema
for all the intents that we specify whether they accept inputs or not
and what types of inputs they accept. The Custom Slot Types can be used
to specify new types of input types(Not important right now). The Sample
Utterances section is used to enter all the sample utterances for each
of the intent that the user may give. This is to make the Alexa Service
better understand which intent the user is specifying.

In the next page, we can test the Skill by giving the text of the speech
that the user gives and it displays the JSON Request and Response sent
to the Lambda Function. We need to set the "Enabled" option for us to
test the skill. The "Enabled" option is in the same page.
