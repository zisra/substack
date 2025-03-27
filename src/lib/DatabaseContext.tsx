import { Database } from '@/lib/database';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [db, setDb] = useState<Database | null>(null);

	useEffect(() => {
		const database = new Database();
		setDb(database);
	}, []);

	return db && <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export const useDatabase = () => {
	const context = useContext(DatabaseContext);
	if (!context) {
		throw new Error('useDatabase must be used within a DatabaseProvider');
	}
	return context;
};
