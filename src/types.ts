export type TSignedMessage = {
  untrustedData: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    inputText: string
    buttonIndex: number
    castId: { fid: number; hash: string }
  }
  trustedData?: {
    messageBytes: string
  }
}

export type TUntrustedData = {
  fid: number
  url: string
  messageHash: string
  timestamp: number
  network: number
  inputText: string
  buttonIndex: number
  castId: { fid: number; hash: string }
}

export type TPostData = 'redirect' | 'mint' | 'start' | 'error'
