export interface Place {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Contact {
  id: string;
  name: string;
  contact: string;
  keepAfterWipe: boolean;
}
