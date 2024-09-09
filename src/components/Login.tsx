import { useState, useEffect } from 'react';
import { getUserProfiles } from '../utils/storage';

interface UserProfile {
  id: number;
  nsec: string;
  npub: string;
  pubkey: string;
  name: string;
  picture?: string;
  lud16?: string;
}

interface LoginProps {
  onCreateProfile: () => void;
  onUserSelect: (user: UserProfile) => void;
}

export default function Login({ onCreateProfile, onUserSelect }: LoginProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const storedUsers = await getUserProfiles();
      setUsers(storedUsers);
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center mb-[20px] mx-[20px]">
      <button
        className="text-white h-[40px] w-[150px] bg-gradient-to-b from-[#9339F4] to-[#105FB0] rounded mt-[25px]"
        onClick={onCreateProfile}
      >
        Create Profile
      </button>
      {users.map((user) => (
        <div
          key={user.id}
          className="hover:brightness-105 hover:text-white mx-[20px] mt-[20px] rounded-full w-full cursor-pointer"
          onClick={() => onUserSelect(user)}
        >
          <div draggable="false" className="flex w-full">
            {user.picture? (
              <div className="h-[70px] w-[70px] rounded-full overflow-hidden">
                <img 
                  src={user.picture}
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div draggable="false">
                <svg className="h-[70px] w-[70px]" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#444444" d="M7.28181 41.0223C10.2003 39.8377 15.6033 37.7566 19.6444 36.85V34.7365C18.6589 33.5244 17.8956 31.3877 17.5446 28.7916C16.8769 28.1679 16.2208 27.065 15.7892 25.7263C15.117 23.6414 15.221 21.7021 15.9858 21.1263C15.9223 20.4163 15.8889 19.6789 15.8889 18.9222C15.8889 18.5928 15.8952 18.267 15.9076 17.9455C15.9167 17.7091 15.9291 17.475 15.9447 17.2435C15.7198 16.5345 15.6 15.79 15.6 15.0222C15.6 10.2358 20.2562 6.35556 26 6.35556C31.7438 6.35556 36.4 10.2358 36.4 15.0222C36.4 15.79 36.2802 16.5345 36.0552 17.2435C36.072 17.4932 36.0852 17.7459 36.0945 18.0015C36.1055 18.3048 36.1111 18.6119 36.1111 18.9222C36.1111 19.6789 36.0777 20.4163 36.0142 21.1263C36.779 21.7021 36.883 23.6414 36.2108 25.7263C35.7792 27.065 35.1231 28.1679 34.4554 28.7916C34.1044 31.3877 33.3411 33.5244 32.3556 34.7365V36.85C36.3967 37.7566 41.7997 39.8377 44.7182 41.0223C48.0227 36.9101 50 31.686 50 26C50 12.7452 39.2548 2 26 2C12.7452 2 2 12.7452 2 26C2 31.686 3.9773 36.9101 7.28181 41.0223ZM5.36405 41.8185C1.99977 37.4363 0 31.9517 0 26C0 11.6406 11.6406 0 26 0C40.3594 0 52 11.6406 52 26C52 32.2822 49.7719 38.0441 46.0629 42.5384C41.2941 48.3168 34.0772 52 26 52C25.9439 52 25.8879 51.9998 25.8319 51.9995C17.4926 51.9467 10.0849 47.9679 5.36405 41.8185Z"/>
                </svg>
              </div>
            )}
            <div className="mx-[8px] overflow-hidden h-[70px] flex flex-col justify-center flex-1">
              <div className="whitespace-nowrap font-bold truncate">{user.name || 'No Name Set'}</div>
              <div className="whitespace-nowrap text-xs truncate">{user.lud16 || 'No wallet address'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};