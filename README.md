# Quectel RM5XX QADBKEY command generator

A browser version of the Quectel ADBKEY unlock script for RM520N-GL, RM502Q-AE, RM500Q-AE, EM120K-GL and other RM5XX series modems. Use it only with devices you own or are authorized to test.

**Web app:** https://yond36.github.io/qadbkey-unlock/

## Use the web app

1. Send `AT+QADBKEY?` to your modem and copy the returned challenge value (for example, `12345678`). Enter the value itself, not a full terminal transcript.
2. Paste it into the web page and select **生成解锁命令** (Generate command).
3. Copy the complete result and send it to the modem's AT port. The example value produces `AT+QADBKEY="0jXKXQwSwMxYoeg"`.

The calculation runs entirely in your browser. The challenge and generated command are not uploaded or stored. The page has no external runtime dependencies. The script follows the Python version's MD5-crypt salt behavior: only the first eight characters of the value are used as salt. Whitespace around the pasted value is removed by the web form.

For background on ADB unlocking, see [Unlocking ADB](https://github.com/iamromulan/cellular-modem-wiki/blob/main/quectel/sdxlemur/sdxlemur_m.2_to_eth.md#unlocking-adb).

## Run locally

Open the static site through a local web server (ES modules do not load from `file://` in all browsers):

```sh
python3 -m http.server 8000
```

Then visit http://127.0.0.1:8000/. No package installation or build step is needed.

The original Python CLI is also available. It uses only the standard library, including on Python versions without the old `crypt` module:

```sh
python3 qadbkey-unlock2.py
# Enter the AT+QADBKEY? response: 12345678
# AT+QADBKEY="0jXKXQwSwMxYoeg"
```

## Verify

```sh
python3 qadbkey-unlock2.py --self-test
node --test test/crypto.test.mjs
```

Both checks cover the same eight known MD5-crypt and unlock-key vectors. The Python command reports `self-test OK (8 vectors)` on success. Node.js is needed only to run the browser algorithm tests.

## Credits and license

This browser port preserves the original script's algorithm and its test vectors. The Python script was modified by [carp4](https://github.com/carp4) to accept the `AT+QADBKEY?` value directly and by [iamromulan](https://github.com/iamromulan) to remove the `sudo` requirement. Earlier contributors include [hornetfighter515](https://github.com/hornetfighter515), [Ryan Bradley](https://github.com/rbradley0), and [igem](https://xnux.eu/devices/feature/qadbkey-unlock.c).

Licensed under [GPL-3.0](LICENSE).
