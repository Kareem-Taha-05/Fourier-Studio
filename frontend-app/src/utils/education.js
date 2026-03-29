/**
 * Educational content for the Emphasizer and Mixer tabs.
 * Each entry has: spatial, frequency, duality strings.
 * Written for someone with zero DSP background.
 */

export const EMPHASIZER_INFO = {
  shift: {
    spatial:   'Moving the image left/right/up/down in the picture frame. Think of sliding a photograph across a desk — the image content is identical, just repositioned.',
    frequency: 'Shifting in space multiplies the FT by a complex exponential. The magnitude spectrum stays exactly the same — same brightness pattern — but the phase spectrum changes everywhere. This is why a shifted image "looks" the same in frequency.',
    duality:   'Shift in one domain = phase rotation in the other. The magnitude (energy distribution) is blind to position — only phase carries location information.',
  },

  multiply_complex_exp: {
    spatial:   'Multiplying the image by a wave pattern — like projecting a striped overlay onto it. The image gets a subtle ripple or tilt imposed on its values.',
    frequency: 'This moves the entire frequency content to a new location in the spectrum. It is the exact dual of a spatial shift: instead of moving the image, you move its frequency fingerprint.',
    duality:   'Multiplying by exp(2πj·u₀x) in space = shift by u₀ in frequency. Spatial shift ↔ frequency modulation are perfect duals of each other.',
  },

  stretch: {
    spatial:   'Enlarging or squishing the image along X or Y. Stretching by 2× makes the image twice as wide.',
    frequency: 'Stretching the image compresses its frequency spectrum — and vice versa. A wider image has finer detail packed into lower frequencies. A squished image spreads energy into higher frequencies.',
    duality:   'Scale in space = inverse scale in frequency. If you stretch the image by factor k, its FT compresses by factor 1/k. This is the scaling duality theorem.',
  },

  mirror: {
    spatial:   'Flipping the image like looking at it in a mirror — left becomes right, or top becomes bottom.',
    frequency: 'Mirroring the image also mirrors the FT. Because the FT of a real image is already symmetrical in some ways, certain flips have surprising effects on phase but leave magnitude unchanged.',
    duality:   'f(−x) ↔ F(−u). Flipping in space flips in frequency. For real images the magnitude spectrum already has conjugate symmetry, so mirroring is most visible in the phase.',
  },

  make_even: {
    spatial:   'Creates a symmetrical image by averaging it with its mirror: result = (image + flipped) / 2. The output looks like a blend of the original and its reflection.',
    frequency: 'An even function has a purely real FT — the imaginary part becomes zero. All the energy is in the real component of the spectrum.',
    duality:   'Even symmetry in space = real-valued FT. This is one of the most elegant properties: symmetry in one domain forces reality in the other.',
  },

  make_odd: {
    spatial:   'Creates an anti-symmetrical image: result = (image − flipped) / 2. Bright areas on one side become dark on the other. The center value is always zero.',
    frequency: 'An odd function has a purely imaginary FT — the real part becomes zero. All energy is in the imaginary component.',
    duality:   'Odd symmetry in space = imaginary-valued FT. Together, even/odd show how symmetry in space precisely controls which component of the FT carries the signal.',
  },

  rotate: {
    spatial:   'Rotates the image by any angle. The canvas expands so no content is clipped.',
    frequency: 'Rotating an image rotates its FT by the same angle. The ring-shaped energy patterns in the FT spin together with the image — they are locked to the image orientation.',
    duality:   'Rotation in space = same rotation in frequency. The FT is "rotation equivariant" — it follows the image exactly. This is why oriented edges always produce oriented streaks in the spectrum.',
  },

  differentiate: {
    spatial:   'Finds edges — computes how fast pixel values change as you move along X or Y. Flat regions become black; sharp boundaries become bright.',
    frequency: 'Differentiation multiplies the FT by j·2π·u (or j·2π·v for Y). This boosts high frequencies (detail) and suppresses low frequencies (flat regions). The spectrum becomes brighter at the edges and darker at the centre.',
    duality:   'Differentiation in space = multiplication by frequency in the FT. High frequencies represent fast changes — edges and texture. This is why sharpening filters work by boosting the high-frequency content.',
  },

  integrate: {
    spatial:   'Accumulates pixel values as you scan along a row or column — like a running total. Bright regions become very bright; everything shifts toward the right/bottom.',
    frequency: 'Integration divides the FT by j·2π·u. This is the opposite of differentiation — it suppresses high frequencies and boosts low ones, creating a blurring effect.',
    duality:   'Integration in space = division by frequency. It is the inverse of differentiation. Blurring and smoothing are both forms of low-pass filtering, which is integration in the frequency view.',
  },

  window: {
    spatial:   'Multiplies the image by a smooth mask (Gaussian, Hamming, etc.) that fades to zero at the edges. This reduces the abrupt "jump" at image boundaries.',
    frequency: 'Multiplying by a window in space is equivalent to convolving the FT with the window\'s own spectrum. A smooth window produces a smoother, more contained frequency spread — less "spectral leakage".',
    duality:   'Multiplication in space = convolution in frequency. This is the convolution theorem. Windowing is essential in signal processing because sharp edges in space cause energy to "leak" across all frequencies.',
  },
};

export const MIXER_INFO = {
  mixMode: {
    spatial:   'The output image is built by combining the FT components of your input images and then running an Inverse FT (IFFT) to get back a spatial image.',
    frequency: 'In Magnitude/Phase mode: one image donates its magnitude (how strong each frequency is) and another donates its phase (where each frequency is positioned). In Real/Imaginary mode you mix the complex parts directly.',
    duality:   'The output is always an IFFT of the mixed FT. You are literally sculpting in the frequency domain and letting the IFFT translate your choices back into a picture.',
  },
  weights: {
    spatial:   'The weight slider controls how much a given image contributes to the mix. Weight = 0 means that image is silent. Weight = 1 means full contribution. You can go above 1 for an over-boosted result.',
    frequency: 'The weighted sum happens entirely in the frequency domain before IFFT. High weight = that image\'s frequency fingerprint dominates. Low weight = its frequencies are whispered into the result.',
    duality:   'Changing weights is like turning the volume knob for each image\'s FT. The final IFFT translates the blended spectrum back into a spatial picture.',
  },
  region: {
    spatial:   'Selecting a region limits which frequencies from each image enter the mix. Inner (low freq) = broad shapes, global structure, overall brightness. Outer (high freq) = fine edges, texture, sharp detail.',
    frequency: 'The rectangle you draw is literally a mask on the 2D frequency spectrum. The centre of the FT represents low frequencies (slow variations), and the edges represent high frequencies (fast changes like edges).',
    duality:   'Masking low frequencies keeps the image\'s shape but loses its detail. Masking high frequencies keeps the detail but loses the structure. Mixing low-freq from one image and high-freq from another is the classic phase/magnitude FT experiment.',
  },
  roles: {
    spatial:   'The role (MAG or PHS) controls what each image contributes. Magnitude captures "how much" of each frequency exists. Phase captures "where" that frequency is positioned — it carries the structural layout of the image.',
    frequency: 'Human perception is more sensitive to phase than magnitude. Swapping phase between two images makes the output look like neither original. Swapping magnitude has a less dramatic effect on recognisability.',
    duality:   'Phase encodes spatial structure; magnitude encodes frequency energy. This is why the famous FT experiment works: taking magnitude of image A and phase of image B produces an image that "looks like" B but with A\'s texture energy.',
  },
};
