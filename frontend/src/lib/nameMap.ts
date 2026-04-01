/**
 * Hardcoded name map for known addresses.
 * Priority: nameMap > Cronos ID > truncated 0x address
 */
export const NAME_MAP: Record<string, string> = {
  '0xb4c50913f70b870f68e6143126163ba0e9186ad7': 'Liquidity Pool',
  '0x1189331089b6ca8bea989c1f2ffd0efadcd33a69': 'Obsidian Finance Router',
  '0xec68090566397dcc37e54b30cc264b2d68cf0489': 'Obsidian Finance Router',
  '0xaf87e4df58d735ec2971d2d8db663b02ca60175d': 'Cronos Legends',
  '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3': 'Obsidian Finance',
  '0x7e3e91b6912042f8fc446385299785ac2f12c0d0': 'haten.cro',
  '0x52076d4f01440225e5a8babb77b3eb1391c617e6': 'TBK',
  '0x32df940edbf734971af4707fe35f3ade91660358': 'Liberty',
  '0xc3f1087176485ec5518cbc88169205ff26f75702': 'Boula',
  '0x36d21fd7eafa01abc35578ea940c545dce8ac10c': 'Zerokrypto',
  '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5': 'AarzyK',
  '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f': 'Snapmaster',
  '0x5148e8932a8f9e7bedb04303a12187e56446956c': 'Baas343',
  '0x5034e11bd0e61f2811396324b685cd58d2f6c206': 'Steve',
  '0x2270cbad5072b7685357ec83ddc959ffde535b27': 'Tohmee',
  '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f': 'Exterminate',
  '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c': 'Rdeepanraj',
  '0x499e30aea1540fda665412c779f00c6dd8a6d27d': 'Awerghx',
  '0xd45b551473f1819ef9fc9efa2c654b98eab21850': 'JePu',
  '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967': 'Naddy',
  '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a': 'El presidentee',
  '0xece1b63218a249708b521e22bbaa7bac35f6f20f': 'Nicholoco',
  '0x172b4e1e7c0772c4dbe152914cef9e9f427c7585': 'CroSsoulL',
  '0x87664c30cfba8fe860439bbf94e3521686dec0de': 'Kikodog',
  '0xe375805d3fb202d028939bb39d2ba9385ffffde6': 'kajebara',
  '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d': 'Seevin',
  '0x0e4eacc2887a58d157a4a9f036f7499ffcc68831': 'Chiefboss',
  '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a': 'ArdentVRory',
  '0x3283b4937d1bbfda4b24d9f110c5731ce209244e': 'Nosnah84',
  '0x782bdee22753ea3e5a4c16cbf8887a098d13b432': 'Paysagiste00',
  '0x584b5505de4a4e7393e915b2e44593934d528d63': 'Willys',
  '0xfb28a731959997bf41e57397209bab78cd2a0406': 'sebastiaan',
  '0x212246c1bb44c4d70ecc1f6fe64c1fe68638624f': 'Gmbino',
  '0xdfb2e6486507a90c820a634f59483470e621ac4b': 'CryptoCharlesManson',
  '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1': 'Memeseason',
  '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75': 'Dougie',
};

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Get display name for an address.
 * Priority: hardcoded name > Cronos ID > truncated 0x
 */
export function getDisplayName(
  address: string,
  cronosIds?: Record<string, string | null>
): string {
  const lower = address.toLowerCase();

  // 1. Hardcoded name
  const hardcoded = NAME_MAP[lower];
  if (hardcoded) return hardcoded;

  // 2. Cronos ID
  if (cronosIds) {
    const cid = cronosIds[lower];
    if (cid) return cid;
  }

  // 3. Truncated address
  return truncateAddress(address);
}