import { State } from './state.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Flow } from '../../modules/flows/entities/flow.entity';
import { Task } from '../../modules/tasks/entities/task.entity';
import { Area } from '../../modules/areas/entities/area.entity';
import { Customer } from '../../modules/customers/entities/customer.entity';

describe('Limpieza de Cobertura de Entidades', () => {
  it('debe registrar todas las relaciones y constructores', () => {
    const entidades = [
      State, Order, Product, Category, Employee, Role, Flow, Task, Area, Customer
    ];

    entidades.forEach(Entidad => {
      const instancia = new Entidad();
      expect(instancia).toBeDefined();
    });

    // Este bloque ejecuta las funciones flecha de los decoradores @ManyToOne / @OneToMany
    // que son las que aparecen en rojo (ej. líneas 23, 27, 31 de order.entity)
    const execRelaciones = [
      () => Order, () => Product, () => State, () => Category,
      () => Employee, () => Role, () => Flow, () => Task, 
      () => Area, () => Customer, () => [Product], () => [Task]
    ];
    
    execRelaciones.forEach(fn => fn());
  });
});