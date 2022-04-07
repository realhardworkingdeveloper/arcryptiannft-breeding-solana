import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

export const FetchNFTs = async (wallet, connection) => {
  try {
    const nftsmetadata = await Metadata.findDataByOwner(connection, wallet);
    return nftsmetadata;
  } catch {
    console.log('Failed to fetch nftsmetadata');
  }
};