### Tasks
- Make cptv-decoder support node streams
- Complete cptv-test-file encoder
- Make a proper v2-v2 transcoder, so we can have a CPTV-snip tool
- Then make a v2-v3 transcoder, and add decoder support for v3 to CPTV-player
- Transcode existing CPTV files to not using variable bit widths other than 8 and 16, and see if that improves compression.
  - If so, that will allow us to have a fast path for those files.
