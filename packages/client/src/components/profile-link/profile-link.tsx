import styles from './profile-link.module.pcss';
import cn from 'classnames';
import { Icon } from 'components/icon';
import { Avatar } from 'components/avatar';

const ICON_COLOR = '#6644EC';

type ProfileLinkProps = {
  label?: string;
  size?: 'small' | 'large';
  name: string;
  email: string;
  avatar?: string;
  onClick?: () => void;
};

export const ProfileLink = ({
  label = 'Профиль',
  size = 'large',
  name,
  email,
  avatar = '',
  onClick,
}: ProfileLinkProps) => {
  return (
    <>
      {size === 'large' && (
        <p className={cn(styles.label, 'text-main')}>{label}</p>
      )}
      <div className={cn(styles.profileLink, styles[size])}>
        {size === 'large' && (
          <div className={styles.info}>
            <div className={styles.avatar}>
              <Avatar size="xs" name={name} avatar={avatar} />
            </div>
            <div className={cn(styles.content, 'text-main')}>
              <div className={styles.name}>{name}</div>
              <div className={styles.email}>{email}</div>
            </div>
          </div>
        )}
        <button className={styles.settings} type="button" onClick={onClick}>
          <Icon size="medium" type="settings" color={ICON_COLOR} />
        </button>
      </div>
    </>
  );
};
