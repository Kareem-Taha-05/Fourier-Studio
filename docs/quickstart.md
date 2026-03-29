# Quickstart

This guide gets you from zero to a running mix in under 5 minutes.

## 1. Start both servers

Open **two terminals**:

=== "Terminal 1 — Backend"

    ```bash
    cd freqwave/backend
    source .venv/bin/activate    # Windows: .venv\Scripts\activate
    uvicorn app.main:app --reload --port 8000
    ```

    Expected output:
    ```
    INFO:     Uvicorn running on http://127.0.0.1:8000
    INFO:     Application startup complete.
    ```

=== "Terminal 2 — Frontend"

    ```bash
    cd freqwave/frontend-app
    npm run dev
    ```

    Expected output:
    ```
      VITE v8.x.x  ready in ~300ms
      ➜  Local:   http://localhost:5173/
    ```

## 2. Open the application

Navigate to **[http://localhost:5173](http://localhost:5173)**.

The navbar should show a green **● SYS ONLINE** indicator. If it shows **OFFLINE**, the backend is not running.

## 3. Run the classic FT experiment (5 minutes)

This demonstrates the most famous result in FT image processing: *phase carries structure, magnitude carries energy.*

### Step 1 — Load two images

On the **Mixer** tab, double-click **IMG 01** and load a portrait or face image.  
Double-click **IMG 02** and load a completely different image (a landscape, object, or second face).

### Step 2 — Assign roles

In the right sidebar under **Image Contributions**:

- Set **IMG 01** role → **MAG**
- Set **IMG 02** role → **PHS**

### Step 3 — Set weights and mix

- IMG 01 weight → **1.0**
- IMG 02 weight → **1.0**
- Mix Mode → **Mag / Phase**

The output appears automatically in **OUTPUT 1**.

### What you should see

The output image will look structurally similar to **IMG 02** (because its phase defines the layout) but with the texture energy and frequency content of **IMG 01** (because its magnitude defines the brightness pattern).

This is the FT duality principle: **phase determines where things are; magnitude determines how strong they are.**

## 4. Try the Emphasizer

Switch to the **Emphasizer** tab.

1. Load an image using the **Load Image** button
2. Select **Shift** from the action dropdown
3. Drag the **Shift Y** slider back and forth

Watch the four oscilloscope screens: the bottom two update in real time showing the shifted image and its FT. Notice the magnitude spectrum is **identical** — only the phase spectrum changes. This is the Shift Theorem.

Click **"What does this do?"** under the parameters to read the full explanation.

## Next Steps

→ [Full Usage Guide](usage.md)  
→ [Architecture Overview](architecture.md)  
→ [API Reference](api/images.md)
