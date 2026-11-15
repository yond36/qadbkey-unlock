# Quectel QADBKEY command generator

A browser version of the Quectel ADBKEY unlock script. Use it only with devices you own or are authorized to test.

**Web app:** https://yond36.github.io/qadbkey-unlock/

## Use the web app

1. Send `AT+QADBKEY?` to your modem and copy the returned challenge value (for example, `12345678`). Enter the value itself, not a full terminal transcript.
2. Paste it into the web page and select **生成命令** (Generate command).
3. Copy the complete result and send it to the modem's AT port. The example value produces `AT+QADBKEY="0jXKXQwSwMxYoeg"`.

The calculation runs entirely in your browser. The challenge and generated command are not uploaded or stored. The page has no external runtime dependencies. The script follows the Python version's MD5-crypt salt behavior: only the first eight characters of the value are used as salt. Whitespace around the pasted value is removed by the web form.

For background on ADB unlocking, see [Unlocking ADB](https://github.com/iamromulan/cellular-modem-wiki/blob/main/quectel/sdxlemur/sdxlemur_m.2_to_eth.md#unlocking-adb).

## ADB connection notes

An `OK` response to the generated unlock command does not guarantee a working ADB connection. Firmware support, USB interface configuration and host drivers also matter.

Before changing the USB configuration, query `AT+QCFG="usbcfg"` and record the original values. Incorrect settings can remove the AT serial port, network interface or other USB interfaces.

In the [RM520N-GL forum discussion](https://forums.quectel.com/t/how-to-enable-adb-interface-for-rm520n-gl/34942/10), posts 19–20 report recovery and working ADB with:

```text
AT+QCFG="usbcfg",0x2C7C,0x0801,1,1,1,1,1,1,0
```

This is a reference for that thread's device and situation, not a universal configuration for every listed model or firmware. Confirm the parameters and required USB interfaces for your device before applying it. Use straight ASCII quotation marks and the explicit hexadecimal PID `0x0801`; the thread's earlier bare `0801` resulted in a different PID. Check USB VID/PID and host drivers if the device is not recognized. If the AT port has disappeared, the thread describes using Linux to restore AT access. Post 10 itself assumes ADB already works when suggesting `/dev/smd7`; it does not explain how to establish an ADB connection.

## Model evidence

The original project lists RM520N-GL, RM502Q-AE, RM500Q-AE and EM120K-GL. The following public Quectel forum examples give a model, challenge and complete answer whose **exact characters** match this calculator. These examples validate key derivation for those challenges; they do not guarantee ADB access on every firmware or interface configuration.

| Model | `AT+QADBKEY?` value | Matching answer | Forum thread |
| --- | --- | --- | --- |
| RM520N-GL | `23398943` | `BzUqe9JGlQoub.z` | [ADB key for RM520N-GL](https://forums.quectel.com/t/adb-key-for-rm520n-gl/26578) |
| RM520N-GLAP | `25816482` | `MPdpWAU6C.BL9Eq` | [RM520N-GLAP ADB](https://forums.quectel.com/t/rm520n-glap-adb/36271) |
| RM521F-GL | `31711264` | `SV3LHz1ynUZZmYU` | [ADB key request](https://forums.quectel.com/t/adb-key-request-for-quectel-modem/29457) |
| RM551E-GL | `47454133` | `yWjfOllPZtKId5Z` | [RM551E-GL ADB key](https://forums.quectel.com/t/adb-unlock-key-rm551e-gl/43758) |
| RG500Q-EA | `14966991` | `WihtftY7/7SWvEd` | [RG500Q-EA ADB key](https://forums.quectel.com/t/rg500q-ea-and-adb-key/30222) |
| RG501-EU | `52582990` | `QFkS3ewn3KNKaX.` | [RG501-EU ADB key](https://forums.quectel.com/t/adb-key-for-rg501-eu/47510) |
| EC25-AF | `35787336` | `zoCLUARzj8zsJIO` | [EC25 ADB interface](https://forums.quectel.com/t/how-to-enable-adb-interface-for-new-ec25-e-modem/21951) |
| EC25-EU | `15478726` | `n9Qq0s1x4LtgAvt` | [EC25 ADB interface](https://forums.quectel.com/t/how-to-enable-adb-interface-for-new-ec25-e-modem/21951) |
| EC25-AFX | `29543536` | `MSkivdUEUOuFJmY` | [EC25 ADB interface](https://forums.quectel.com/t/how-to-enable-adb-interface-for-new-ec25-e-modem/21951) |
| EG25G | `32382643` | `Z1mVbkVsGNRUyQ2` | [EC21, EC25, EG25 requests](https://forums.quectel.com/t/adb-key-request-for-ec21-ec25-eg25/29153) |
| EC25E | `29866718` | `ArJutRI0gTdus7t` | [EC21, EC25, EG25 requests](https://forums.quectel.com/t/adb-key-request-for-ec21-ec25-eg25/29153) |

The forum did not expose a complete public challenge/answer pair specifically identified as RM502Q-AE, RM500Q-AE or EM120K-GL during this review, so those three remain listed on the original project's basis. Some threads report firmware-dependent behavior: the RG501-EU requester succeeded on R12 after an error on R13, while the RM520N-GLAP command returned `OK` but ADB required a separate PCIe configuration change. An EC21E forum answer did not match this algorithm, and the longer structured RM500U-family answers use a different format; neither was added to the site.

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

The Python self-test checks eight known vectors. The Node tests check those same vectors plus one forum example per model in the table above. Node.js is needed only to run the browser algorithm tests.

## Credits and license

This browser port preserves the original script's algorithm and its test vectors. The Python script was modified by [carp4](https://github.com/carp4) to accept the `AT+QADBKEY?` value directly and by [iamromulan](https://github.com/iamromulan) to remove the `sudo` requirement. Earlier contributors include [hornetfighter515](https://github.com/hornetfighter515), [Ryan Bradley](https://github.com/rbradley0), and [igem](https://xnux.eu/devices/feature/qadbkey-unlock.c).

Licensed under [GPL-3.0](LICENSE).
